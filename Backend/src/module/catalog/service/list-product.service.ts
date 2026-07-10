import {
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ListEntity } from '../model/list.entity';
import {  Repository } from 'typeorm';
import { ListProductEntity } from '../model/list-product.entity';
import { CreateListProductDto } from '../model/dto/create-list-product.dto';
import { ProductEntity } from '../model/product.entity';
import { ListProductResponse } from '../model/type/list-product.response';
import { PriceEntity } from '../model/price.entity';
import {
  ListProductCreateConflictException,
  ListProductCreateException,
  ListProductCreateNotFoundListException,
  ListProductCreateNotFoundProductException,
  ListProductDeleteException,
  ListProductDeleteNotFoundException,
  ListProductGetByListException,
} from '../catalog.exception';

@Injectable()
export class ListProductService {
  constructor(
    @InjectRepository(ListEntity) private readonly listRepository: Repository<ListEntity>,
    @InjectRepository(ListProductEntity) private readonly listProductRepository: Repository<ListProductEntity>,
    @InjectRepository(ProductEntity) private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(PriceEntity) private readonly priceRepository: Repository<PriceEntity>,
  ) {}

  async createListProduct(dto: CreateListProductDto) {
    const existingListProduct = await this.listProductRepository.findOne({
      where: {
        // customName: ILike(dto.customName),
        product: { productId: dto.productId },
        list: { listId: dto.listId },
      },
    });
    if (existingListProduct) {
      throw new ListProductCreateConflictException();
    }
    const list = await this.listRepository.findOne({ where: { listId: dto.listId } });
    if (!list) {
      throw new ListProductCreateNotFoundListException();
    }
    const product = await this.productRepository.findOne({ where: { productId: dto.productId } });
    if (!product) {
      throw new ListProductCreateNotFoundProductException();
    }
    try {

      const listProduct = new ListProductEntity();
      listProduct.product = product;
      listProduct.list = list;

      return await this.listProductRepository.save(listProduct);

    } catch (e) {
      throw new ListProductCreateException();
    }

  }

  async getListProductsByList(listId: number): Promise<ListProductResponse[]> {

    try {
      const subQuery = this.priceRepository
        .createQueryBuilder('price2')
        .select('MAX(price2.priceDate)', 'maxDate')
        .where('price2.productId = product.productId')
        .getQuery();

      const queryBuilder = this.listProductRepository
        .createQueryBuilder('listProduct')
        .leftJoinAndSelect('listProduct.product', 'product')
        .leftJoinAndSelect('product.store', 'store')
        .leftJoinAndSelect('store.brand', 'brand')
        .leftJoinAndSelect(
          'product.prices',
          'price',
          `price.priceDate = (${subQuery})`
        )
        .where('listProduct.listId = :listId', { listId })
        .orderBy('price.created', 'DESC')
        .getMany();

      const listProducts = await queryBuilder;

      return listProducts.map((listProduct) => ({
        created: listProduct.created,
        listProductId: listProduct.listProductId,

        productId: listProduct.product.productId,
        name: listProduct.product.name,
        brand: listProduct.product.brand,
        unit: listProduct.product.unit,
        quantity: listProduct.product.quantity,
        productPrice: listProduct.product.prices[0].productPrice,
        referencePrice: listProduct.product.prices[0].referencePrice,
        priceDate: listProduct.product.prices[0].priceDate,
        storeName: listProduct.product.store.name,
        storeStreet: listProduct.product.store.street,
        storeNumber: listProduct.product.store.number,
        storePostalCode: listProduct.product.store.postalCode,
        storeCity: listProduct.product.store.city,
        storeBrand: listProduct.product.store.brand
          ? {
              brandId: listProduct.product.store.brand.brandId,
              name: listProduct.product.store.brand.name,
              textColor: listProduct.product.store.brand.textColor,
              bgColor: listProduct.product.store.brand.bgColor,
              gradientColor: listProduct.product.store.brand.gradientColor,
            }
          : null,
      }));
    } catch (e) {
      throw new ListProductGetByListException();
    }


  }

  async deleteListProduct(listProductId: number): Promise<void> {
    const listProduct = await this.listProductRepository.findOne({
      where: { listProductId },
    });
    if (!listProduct) {
      throw new ListProductDeleteNotFoundException();
    }
    try {
      await this.listProductRepository.remove(listProduct);
    } catch (e) {
      throw new ListProductDeleteException();
    }
  }

}