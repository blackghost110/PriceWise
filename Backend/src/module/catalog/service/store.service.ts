import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { StoreEntity } from '../model/store.entity';
import { ProductEntity } from '../model/product.entity';
import { CreateStoreDto } from '../model/dto/create-store.dto';
import { Credential } from '../../../security/model/entity/credential.entity';
import { StoreProductsResponse } from '../model/type/store-products.response';
import { PriceEntity } from '../model/price.entity';
import {
  ListDeleteException,
  ListDeleteNotFoundException,
  StoreCreateConflictException,
  StoreCreateException,
  StoreFindAllException,
  StoreFindTwoException,
  StoreGetProductsException,
  StoreInfoException,
  StoreUpdateException,
  StoreUpdateNotFoundException,
} from '../catalog.exception';
import { UpdateStoreDto } from '../model/dto/update-store.dto';
import { XpService } from '../../gamification/service/xp.service';
import { ActivityLogService } from '../../activity-log/service/activity-log.service';
import { EntityType } from '../../activity-log/model/activity-log.entity';
import { StoreBrandService } from './store-brand.service';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(PriceEntity)
    private readonly priceRepository: Repository<PriceEntity>,
    private readonly xpService: XpService,
    private readonly activityLogService: ActivityLogService,
    private readonly storeBrandService: StoreBrandService,
  ) {}

  async createStore(createStoreDto: CreateStoreDto, user: Credential) {
    const existingStore = await this.storeRepository.findOne({
      where: {
        name: ILike(createStoreDto.name),
        street: ILike(createStoreDto.street),
        number: ILike(createStoreDto.number),
        postalCode: ILike(createStoreDto.postalCode),
        city: ILike(createStoreDto.city),
      },
    });
    if (existingStore) {
      throw new StoreCreateConflictException();
    }

    try {
      const store = new StoreEntity();
      Object.assign(store, createStoreDto);
      store.credentialId = user.credentialId;

      // 1 seule couleur par nom de magasin : réutilise la marque existante si elle existe,
      // sinon la crée à partir des couleurs soumises.
      const brand = await this.storeBrandService.resolveForCreate(createStoreDto.name, {
        textColor: createStoreDto.textColor,
        bgColor: createStoreDto.bgColor,
        gradientColor: createStoreDto.gradientColor,
      });
      store.brandId = brand.brandId;

      const saved = await this.storeRepository.save(store);
      // Attribuer +10 XP (best-effort, n'annule pas la création en cas d'erreur)
      this.xpService.awardStoreXp(user.credentialId).catch(() => {});
      // Journalisation (best-effort)
      this.activityLogService.logAdd(EntityType.STORE, saved.storeId, user.credentialId).catch(() => {});
      return saved;
    } catch (e) {
      throw new StoreCreateException();
    }
  }

  async findAll(): Promise<StoreEntity[]> {
    try {
      return await this.storeRepository.find({ relations: { brand: true } });
    } catch (e) {
      throw new StoreFindAllException();
    }
  }

  async findTwoLast(): Promise<StoreEntity[]> {
    try {
      return await this.storeRepository.find({
        order: { created: 'DESC' },
        take: 2,
        relations: { brand: true },
      });
    } catch (e) {
      throw new StoreFindTwoException();
    }
  }

  async getStoreInfo(storeId: number) {
    try {
      return await this.storeRepository.findOne({ where: { storeId: storeId } });
    } catch (e) {
      throw new StoreInfoException();
    }
  }

  async getStoreProducts(storeId: number): Promise<StoreProductsResponse[]> {
    try {
      const subQuery = this.priceRepository
        .createQueryBuilder('price2')
        .select('MAX(price2.priceDate)', 'maxDate')
        .where('price2.productId = product.productId')
        .getQuery();

      const queryBuilder = this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect(
          'product.prices',
          'price',
          `price.priceDate = (${subQuery})`,
        )
        .where('product.storeId = :storeId', { storeId })
        .orderBy('price.created', 'DESC')
        .getMany();

      const products = await queryBuilder;

      // return products

      return products.map((product) => ({
        productId: product.productId,
        name: product.name,
        brand: product.brand,
        unit: product.unit,
        quantity: product.quantity,
        productPrice: product.prices[0].productPrice,
        referencePrice: product.prices[0].referencePrice,
        priceDate: product.prices[0].priceDate,
      }));
    } catch (e) {
      throw new StoreGetProductsException();
    }

  }

  // ----- verifier cette fonction CORRIGER LES EXCEPTIONS
  async deleteStore(storeId: number, credentialId: string): Promise<void> {
    const store = await this.storeRepository.findOne({
      where: { storeId } });
    if (!store) {
      throw new ListDeleteNotFoundException();
    }
    try {
      await this.storeRepository.remove(store);
      // Journalisation (best-effort)
      this.activityLogService.logDelete(EntityType.STORE, storeId, credentialId).catch(() => {});
    } catch (e) {
      throw new ListDeleteException();
    }
  }

  async updateStore(dto: UpdateStoreDto, storeId: number, credentialId: string) {
    // Vérification que le store existe
    const store = await this.storeRepository.findOne({ where: { storeId } });
    if (!store) {
      throw new StoreUpdateNotFoundException();
    }

    const before = { ...store };

    try {
      // Mise à jour des champs
      store.name = dto.name;
      store.street = dto.street;
      store.number = dto.number;
      store.postalCode = dto.postalCode;
      store.city = dto.city;

      // Si des couleurs sont fournies, met à jour la marque partagée pour ce nom :
      // tous les magasins portant ce nom suivent automatiquement la nouvelle couleur.
      if (dto.textColor || dto.bgColor || dto.gradientColor) {
        const brand = await this.storeBrandService.upsertForUpdate(dto.name, {
          textColor: dto.textColor,
          bgColor: dto.bgColor,
          gradientColor: dto.gradientColor,
        });
        store.brandId = brand.brandId;
      }

      const saved = await this.storeRepository.save(store);
      // Journalisation (best-effort)
      this.activityLogService.logUpdate(EntityType.STORE, storeId, credentialId, before, { ...saved }).catch(() => {});
      return saved;

    } catch (e) {
      throw new StoreUpdateException();
    }
  }

}
