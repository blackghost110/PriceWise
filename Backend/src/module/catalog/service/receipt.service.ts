import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreEntity } from '../model/store.entity';
import { ProductEntity } from '../model/product.entity';
import { PriceEntity } from '../model/price.entity';
import { Credential } from '../../../security/model/entity/credential.entity';
import { GeminiReceiptItem, GeminiService } from './gemini.service';
import { ProductService } from './product.service';
import { PriceService } from './price.service';
import { ScanReceiptDto } from '../model/dto/scan-receipt.dto';
import { ApplyReceiptDto, ApplyReceiptItemDto } from '../model/dto/apply-receipt.dto';
import { CreateProductDto } from '../model/dto/create-product.dto';
import { CreatePriceDto } from '../model/dto/create-price.dto';
import { UpdatePriceDto } from '../model/dto/update-price.dto';
import { ReceiptScanItemResponse } from '../model/type/receipt-scan.response';
import { ReceiptApplyResponse } from '../model/type/receipt-apply.response';
import { ProductCreateConflictException, ReceiptStoreNotFoundException } from '../catalog.exception';
import { computeReferencePrice } from '../util/product-price.util';
import { isDuplicateItem, matchReceiptItem } from '../util/receipt-matching.util';

@Injectable()
export class ReceiptService {
  constructor(
    @InjectRepository(StoreEntity) private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(PriceEntity) private readonly priceRepository: Repository<PriceEntity>,
    private readonly geminiService: GeminiService,
    private readonly productService: ProductService,
    private readonly priceService: PriceService,
  ) {}

  async scan(storeId: number, dto: ScanReceiptDto): Promise<ReceiptScanItemResponse[]> {
    const store = await this.storeRepository.findOne({ where: { storeId } });
    if (!store) {
      throw new ReceiptStoreNotFoundException();
    }

    const storeProducts = await this.productRepository.find({ where: { store: { storeId } } });
    const detectedItems = await this.geminiService.scanReceipt(dto.imageBase64, dto.mimeType);

    // Filet de sécurité si l'IA n'a pas déjà fusionné des lignes identiques (même article, même prix).
    const deduped: GeminiReceiptItem[] = [];
    for (const item of detectedItems) {
      if (!deduped.some((existing) => isDuplicateItem(existing, item))) {
        deduped.push(item);
      }
    }

    return deduped.map((item) => {
      const match = matchReceiptItem(
        item.name,
        item.brand,
        storeProducts.map((p) => ({ productId: p.productId, name: p.name, brand: p.brand })),
      );

      // Quand un produit existant est trouvé, on met à jour SON prix : le nom/marque/unité/quantité
      // affichés doivent donc refléter ce produit tel qu'il est déjà enregistré (ex. "Emmental" en
      // 200g), pas la supposition brute de l'IA (souvent 'p'/1 quand le ticket ne précise rien),
      // sinon le prix brut calculé plus bas serait incohérent avec l'historique de prix du produit.
      const matchedProduct = match.productId ? storeProducts.find((p) => p.productId === match.productId) : undefined;
      const unit = (matchedProduct?.unit ?? item.unit) as 'g' | 'ml' | 'p';
      const quantity = matchedProduct?.quantity ?? item.quantity;

      return {
        rawName: item.rawName,
        name: matchedProduct?.name ?? item.name,
        brand: matchedProduct?.brand ?? item.brand,
        unit,
        quantity,
        productPrice: item.unitPrice,
        referencePrice: computeReferencePrice(item.unitPrice, quantity, unit),
        match: {
          status: match.productId ? 'existing' : 'new',
          productId: match.productId,
          matchedName: match.matchedName,
          confidence: match.confidence,
        },
      };
    });
  }

  async apply(user: Credential, storeId: number, dto: ApplyReceiptDto): Promise<ReceiptApplyResponse> {
    const store = await this.storeRepository.findOne({ where: { storeId } });
    if (!store) {
      throw new ReceiptStoreNotFoundException();
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of dto.items) {
      try {
        if (item.productId) {
          await this.upsertPriceForToday(user, item.productId, item.productPrice, item.referencePrice);
          updated++;
          continue;
        }

        try {
          await this.createProductFromReceiptItem(user, storeId, item);
          created++;
        } catch (e) {
          if (!(e instanceof ProductCreateConflictException)) {
            throw e;
          }
          // Doublon réel détecté par ProductService (nom+marque+unité+quantité déjà présents dans ce
          // magasin) : on retombe sur une mise à jour de prix plutôt que d'échouer la ligne.
          const existing = await this.productRepository.findOne({
            where: { name: item.name, brand: item.brand ?? '', unit: item.unit as any, quantity: item.quantity, store: { storeId } },
          });
          if (!existing) {
            throw e;
          }
          await this.upsertPriceForToday(user, existing.productId, item.productPrice, item.referencePrice);
          updated++;
        }
      } catch (e) {
        skipped++;
      }
    }

    return { created, updated, skipped };
  }

  private async createProductFromReceiptItem(user: Credential, storeId: number, item: ApplyReceiptItemDto) {
    const createDto = new CreateProductDto();
    // Object.assign contourne le typage strict de `unit: ProductUnitType` (même technique que
    // ProductService.createProduct) : l'app stocke réellement 'g' | 'ml' | 'p', pas l'enum backend
    // ProductUnitType.PIECE = 'piece' qui n'est jamais utilisée par le flux de création frontend.
    Object.assign(createDto, {
      name: item.name,
      brand: item.brand ?? '',
      unit: item.unit,
      quantity: item.quantity,
      initialPrice: item.productPrice,
      initialReferencePrice: item.referencePrice,
    });
    return this.productService.createProduct(user, storeId, createDto);
  }

  /**
   * Applique le prix scanné au produit : écrase le prix déjà enregistré aujourd'hui s'il existe,
   * sinon en crée un nouveau. Comparaison faite via CURRENT_DATE côté SQL (même référence que le
   * défaut de colonne `price.priceDate`) pour éviter tout souci de fuseau horaire / format JS.
   */
  private async upsertPriceForToday(user: Credential, productId: number, productPrice: number, referencePrice: number) {
    const existingPrice = await this.priceRepository
      .createQueryBuilder('price')
      .where('price.productId = :productId', { productId })
      .andWhere('price.priceDate = CURRENT_DATE')
      .getOne();

    if (existingPrice) {
      const updateDto = new UpdatePriceDto();
      updateDto.productPrice = productPrice;
      updateDto.referencePrice = referencePrice;
      await this.priceService.updatePrice(user.credentialId, updateDto, existingPrice.priceId);
    } else {
      const createDto = new CreatePriceDto();
      createDto.productPrice = productPrice;
      createDto.referencePrice = referencePrice;
      await this.priceService.createPrice(user.credentialId, createDto, productId);
    }
  }
}
