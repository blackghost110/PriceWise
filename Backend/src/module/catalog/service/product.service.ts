import { ConflictException, Injectable, NotFoundException} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {ProductEntity} from "../model/product.entity";
import {CreateProductDto} from "../model/dto/create-product.dto";
import {ListEntity} from "../model/list.entity";
import {PriceEntity} from "../model/price.entity";
import {Credential} from "../../../security/model/entity/credential.entity";
import {StoreEntity} from "../model/store.entity";
import { StoreProductsResponse } from '../model/type/store-products.response';
import { AllProductsResponse } from '../model/type/all-products.response';
import { ProductDetailResponse } from '../model/type/product-detail.response';

@Injectable()
export class ProductService {
    constructor(@InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,
                @InjectRepository(ListEntity) private readonly listRepository: Repository<ListEntity>,
                @InjectRepository(PriceEntity) private readonly priceRepository: Repository<PriceEntity>,
                @InjectRepository(StoreEntity) private readonly storeRepository: Repository<StoreEntity>,) {}

    async createProduct(user: Credential, storeId: number, createProductDto: CreateProductDto) {

        const store = await this.storeRepository.findOne({ where: { storeId: storeId }})
        if (!store) {
            throw new NotFoundException('Store not found');
        }

        const existingProduct = await this.productRepository.findOne({
            where: {
                name: createProductDto.name,
                brand: createProductDto.brand,
                unit: createProductDto.unit,
                quantity: createProductDto.quantity,
                store: {storeId: storeId},
            }
        })
        if (existingProduct) {
            throw new ConflictException(`Product named '${existingProduct.name}' already exists in this store`);
        }

        const product = new ProductEntity();
        Object.assign(product, createProductDto)
        product.store = store;

        const price = new PriceEntity();
        price.productPrice = createProductDto.initialPrice;
        price.grossPrice = createProductDto.initialGrossPrice;
        price.user = user;

        product.prices = [price];

        return await this.productRepository.save(product)
    }

    async findAll(): Promise<ProductEntity[]> {
        return await this.productRepository.find()
    }


  async getAllProducts(): Promise<AllProductsResponse[]> {

    const subQuery = this.priceRepository
      .createQueryBuilder('price2')
      .select('MAX(price2.priceDate)', 'maxDate')
      .where('price2.productId = product.productId')
      .getQuery();

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.store', 'store')
      .leftJoinAndSelect(
        'product.prices',
        'price',
        `price.priceDate = (${subQuery})`
      )
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
      priceDate: product.prices[0].priceDate,
      storeName: product.store.name,
      storeStreet: product.store.street,
      storeNumber: product.store.number,
      storePostalCode: product.store.postalCode,
      storeCity: product.store.city
    }));
  }

  async getProductDetails(productId: number): Promise<ProductDetailResponse> {
      const product = await this.productRepository.findOne({
        where: { productId: productId },
        relations: ['store', 'prices'],
        order: {prices: { priceDate: 'ASC'} }
      })
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return {
      productId: product.productId,
      name: product.name,
      brand: product.brand,
      unit: product.unit,
      quantity: product.quantity,

      storeName: product.store.name,
      storeStreet: product.store.street,
      storeNumber: product.store.number,
      storePostalCode: product.store.postalCode,
      storeCity: product.store.city,

      prices: product.prices.map((price) => ({
        priceId: price.priceId,
        productPrice: (price.productPrice),
        grossPrice: (price.grossPrice),
        priceDate: price.priceDate
      }))
    };
  }


}