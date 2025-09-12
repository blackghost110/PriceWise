import {ConflictException, Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {ILike, Repository} from "typeorm";
import {StoreEntity} from "../model/store.entity";
import {ProductEntity} from "../model/product.entity";
import {CreateStoreDto} from "../model/dto/create-store.dto";
import {StoreProductsResponse} from "../model/type/store-products.response";
import { PriceEntity } from '../model/price.entity';



@Injectable()
export class StoreService {
    constructor(@InjectRepository(StoreEntity) private readonly storeRepository: Repository<StoreEntity>,
                @InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,
                @InjectRepository(PriceEntity) private readonly priceRepository: Repository<PriceEntity>,) {}

    async createStore(createStoreDto: CreateStoreDto) {

        const existingStore = await this.storeRepository.findOne({
            where: {
                name: ILike(createStoreDto.name),
                street: ILike(createStoreDto.street),
                number: ILike(createStoreDto.number),
                postalCode: ILike(createStoreDto.postalCode),
                city: ILike(createStoreDto.city)
            }
        })
        if (existingStore) {
            throw new ConflictException(`Store named '${existingStore.name}' already exists at this address`);
        }

        const store = new StoreEntity()
        Object.assign(store, createStoreDto)
        return await this.storeRepository.save(store)
    }

    async findAll(): Promise<StoreEntity[]> {
        return await this.storeRepository.find()
    }

    async getStoreInfo(storeId: number) {
        return await this.storeRepository.findOne({ where: { storeId: storeId } })
    }


  async getStoreProducts(storeId: number): Promise<StoreProductsResponse[]> {

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
        `price.priceDate = (${subQuery})`
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
      grossPrice: product.prices[0].grossPrice,
      priceDate: product.prices[0].priceDate
    }));
  }




}