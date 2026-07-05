import { Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {PriceEntity} from "../model/price.entity";
import { Repository} from "typeorm";
import {CreatePriceDto} from "../model/dto/create-price.dto";
import {Credential} from "../../../security/model/entity/credential.entity";
import {ProductEntity} from "../model/product.entity";
import { UpdatePriceDto } from '../model/dto/update-price.dto';
import {
  PriceCreateBadRequestException,
  PriceCreateConflictException,
  PriceCreateException,
  PriceCreateProductNotFoundException,
  PriceCreateUserNotFoundException,
  PriceGetLastPriceException,
  PriceGetPricesException,
  PriceGetUsersCountException,
  PriceUpdateBadRequestException,
  PriceUpdateException,
  PriceUpdateNotFoundException,
  PriceUpdateUserNotFoundException,
} from '../catalog.exception';
import { UserPriceCountResponse } from '../model/type/user-price-count.response';
import { XpService } from '../../gamification/service/xp.service';
import { ActivityLogService } from '../../activity-log/service/activity-log.service';
import { EntityType } from '../../activity-log/model/activity-log.entity';

@Injectable()
export class PriceService {
    constructor(
      @InjectRepository(PriceEntity) private readonly priceRepository: Repository<PriceEntity>,
      @InjectRepository(Credential) private readonly credentialRepository: Repository<Credential>,
      @InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,
      private readonly xpService: XpService,
      private readonly activityLogService: ActivityLogService,
    ) {}

    async createPrice(userId: string , createPriceDto: CreatePriceDto, productId: number) {
        const user = await this.credentialRepository.findOne({ where: { credentialId: userId }})
        if (!user) {
          throw new PriceCreateUserNotFoundException();
        }
        const product = await this.productRepository.findOne({ where: { productId } });
        if (!product) {
          throw new PriceCreateProductNotFoundException();
        }
        if (createPriceDto.productPrice <= 0 || createPriceDto.referencePrice <= 0) {
          throw new PriceCreateBadRequestException();
        }


        const existingPrice = await this.priceRepository.findOne({
            where: {
                product: {productId: productId},
                priceDate: createPriceDto.priceDate
            }
        })
        if (existingPrice) {
          throw new PriceCreateConflictException({
            priceId: existingPrice.priceId,
            productPrice: existingPrice.productPrice,
            referencePrice: existingPrice.referencePrice
          });
        }

      try {

        const price = new PriceEntity();
        price.productPrice = createPriceDto.productPrice;
        price.referencePrice = createPriceDto.referencePrice;
        price.product = product;
        price.user = user;

        if (createPriceDto.priceDate) {
          price.priceDate = createPriceDto.priceDate;
        }

        const saved = await this.priceRepository.save(price);
        // Attribuer +1 XP + vérification cercle hebdo (best-effort)
        this.xpService.awardPriceXp(userId).catch(() => {});
        // Journalisation (best-effort)
        this.activityLogService.logAdd(EntityType.PRICE, saved.priceId, userId).catch(() => {});
        return saved;

      } catch (e) {
        throw new PriceCreateException();
      }


    }

    async getProductPrices(productId: number) {
      try {

        return await this.priceRepository.find({
          where: {
            product: {productId: productId}
          },
          order: {
            priceDate: 'DESC'
          }
        })

      } catch (e) {
        throw new PriceGetPricesException();
      }


    }

    async getProductLastPrice(productId: number) {
      try {

        return await this.priceRepository.findOne({
          where: { product: {productId} },
          order: { priceDate: 'DESC'}
        })

      } catch (e) {
        throw new PriceGetLastPriceException();
      }

    }

  async updatePrice(userId: string, updatePriceDto: UpdatePriceDto, priceId: number) {
    // Vérification de l'utilisateur
    const user = await this.credentialRepository.findOne({ where: { credentialId: userId }});
    if (!user) {
      throw new PriceUpdateUserNotFoundException();
    }

    // Vérification que le prix existe
    const price = await this.priceRepository.findOne({ where: { priceId } });
    if (!price) {
      throw new PriceUpdateNotFoundException();
    }

    // Validation des prix (seulement si ils sont fournis)
    if (updatePriceDto.productPrice !== undefined && updatePriceDto.productPrice <= 0) {
      throw new PriceUpdateBadRequestException();
    }
    if (updatePriceDto.referencePrice !== undefined && updatePriceDto.referencePrice <= 0) {
      throw new PriceUpdateBadRequestException();
    }

    const before = { ...price };

    try {
      // Mise à jour seulement des champs fournis
      if (updatePriceDto.productPrice !== undefined) {
        price.productPrice = updatePriceDto.productPrice;
      }
      if (updatePriceDto.referencePrice !== undefined) {
        price.referencePrice = updatePriceDto.referencePrice;
      }

      // Mise à jour de l'utilisateur qui modifie
      price.user = user;

      const saved = await this.priceRepository.save(price);
      // Journalisation (best-effort)
      this.activityLogService.logUpdate(EntityType.PRICE, priceId, userId, before, { ...saved }).catch(() => {});
      return saved;

    } catch (e) {
      throw new PriceUpdateException();
    }
  }


  async getUsersPriceCount(): Promise<UserPriceCountResponse[]>{
    try {
      return await this.priceRepository
        .createQueryBuilder('price')
        .leftJoin('price.user', 'user')
        .select([
          'user.credentialId AS "userId"',
          'user.displayName AS "displayName"',
          'COUNT(price.priceId) AS priceCount'
        ])
        .groupBy('user.credentialId, user.displayName')
        .orderBy('priceCount', 'DESC')
        .getRawMany();

      // return result;
    } catch (e) {
      console.log('Error Log :', e);
      throw new PriceGetUsersCountException();
    }
  }


}