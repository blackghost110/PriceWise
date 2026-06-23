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

@Injectable()
export class PriceService {
    constructor(@InjectRepository(PriceEntity) private readonly priceRepository: Repository<PriceEntity>,
                @InjectRepository(Credential) private readonly credentialRepository: Repository<Credential>,
                @InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,) {}

    async createPrice(userId: string , createPriceDto: CreatePriceDto, productId: number) {
        const user = await this.credentialRepository.findOne({ where: { credentialId: userId }})
        if (!user) {
          throw new PriceCreateUserNotFoundException();
        }
        const product = await this.productRepository.findOne({ where: { productId } });
        if (!product) {
          throw new PriceCreateProductNotFoundException();
        }
        if (createPriceDto.productPrice <= 0 || createPriceDto.grossPrice <= 0) {
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
            grossPrice: existingPrice.grossPrice
          });
        }

      try {

        const price = new PriceEntity();
        price.productPrice = createPriceDto.productPrice;
        price.grossPrice = createPriceDto.grossPrice;
        price.product = product;
        price.user = user;

        if (createPriceDto.priceDate) {
          price.priceDate = createPriceDto.priceDate;
        }

        return await this.priceRepository.save(price);

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
    if (updatePriceDto.grossPrice !== undefined && updatePriceDto.grossPrice <= 0) {
      throw new PriceUpdateBadRequestException();
    }

    try {
      // Mise à jour seulement des champs fournis
      if (updatePriceDto.productPrice !== undefined) {
        price.productPrice = updatePriceDto.productPrice;
      }
      if (updatePriceDto.grossPrice !== undefined) {
        price.grossPrice = updatePriceDto.grossPrice;
      }

      // Mise à jour de l'utilisateur qui modifie
      price.user = user;

      return await this.priceRepository.save(price);

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