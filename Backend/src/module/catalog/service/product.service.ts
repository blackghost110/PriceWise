import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {ProductEntity} from "../model/product.entity";
import {CreateProductDto} from "../model/dto/create-product.dto";
import {PriceEntity} from "../model/price.entity";
import {Credential} from "../../../security/model/entity/credential.entity";
import {StoreEntity} from "../model/store.entity";
import { AllProductsResponse } from '../model/type/all-products.response';
import { ProductDetailResponse } from '../model/type/product-detail.response';
import {
  ProductCreateConflictException,
  ProductCreateException,
  ProductCreateNotFoundException,
  ProductDeleteException,
  ProductDeleteNotFoundException,
  ProductDetailNotFoundException,
  ProductGetAllException,
} from '../catalog.exception';
import { GetAllProductsQueryDTO } from '../model/dto/get-all-products-query.dto';

@Injectable()
export class ProductService {
    constructor(@InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,
                @InjectRepository(PriceEntity) private readonly priceRepository: Repository<PriceEntity>,
                @InjectRepository(StoreEntity) private readonly storeRepository: Repository<StoreEntity>,) {}

    async createProduct(user: Credential, storeId: number, createProductDto: CreateProductDto) {

        const store = await this.storeRepository.findOne({ where: { storeId: storeId }})
        if (!store) {
          throw new ProductCreateNotFoundException();
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
          throw new ProductCreateConflictException();
        }

      try {

        const product = new ProductEntity();
        Object.assign(product, createProductDto)
        product.store = store;

        const price = new PriceEntity();
        price.productPrice = createProductDto.initialPrice;
        price.grossPrice = createProductDto.initialGrossPrice;
        price.user = user;

        product.prices = [price];

        return await this.productRepository.save(product)

      } catch (e) {
        throw new ProductCreateException();
      }

    }

  async getAllProducts(query: GetAllProductsQueryDTO): Promise<AllProductsResponse[]> {
    try {
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
        .orderBy('price.created', 'DESC');

        if (query.storeName) {
          queryBuilder.andWhere('store.name ILIKE :storeName', { storeName : `%${query.storeName}%` })
        }
        if (query.storePostalCode){
          queryBuilder.andWhere('store.postalCode LIKE :storePostalCode', { storePostalCode : query.storePostalCode })
        }


      const products = await queryBuilder.getMany();

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
    } catch (e) {
      console.log('Error Log :', e);
      throw new ProductGetAllException();
    }

  }

  async getProductDetails(productId: number): Promise<ProductDetailResponse> {
      const product = await this.productRepository.findOne({
        where: { productId: productId },
        relations: ['store', 'prices'],
        order: {prices: { priceDate: 'ASC'} }
      })
    if (!product) {
      throw new ProductDetailNotFoundException();
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

  // Verifier les exceptions
  async deleteProduct(productId: number): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { productId } });
    if (!product) {
      throw new ProductDeleteNotFoundException();
    }
    try {
      await this.productRepository.remove(product);
    } catch (e) {
      throw new ProductDeleteException();
    }
  }


}