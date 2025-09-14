import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ListEntity } from '../model/list.entity';
import { ILike, Repository } from 'typeorm';
import { ListProductEntity } from '../model/list-product.entity';
import { CreateListProductDto } from '../model/dto/create-list-product.dto';
import { CreateStoreDto } from '../model/dto/create-store.dto';
import { StoreEntity } from '../model/store.entity';
import { ProductEntity } from '../model/product.entity';
import { ProductService } from './product.service';
import { ListProductResponse } from '../model/type/list-product.response';
import { PriceEntity } from '../model/price.entity';

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
      throw new ConflictException(`product is already in this list`,);
    }
    const list = await this.listRepository.findOne({ where: { listId: dto.listId } });
    if (!list) {
      throw new NotFoundException(`list not found`,);
    }
    const product = await this.productRepository.findOne({ where: { productId: dto.productId } });
    if (!product) {
      throw new NotFoundException(`product not found`,);
    }

    const listProduct = new ListProductEntity();
    listProduct.product = product;
    listProduct.list = list;

    return await this.listProductRepository.save(listProduct);
  }

  async getListProductsByList(listId: number): Promise<ListProductResponse[]> {

    const subQuery = this.priceRepository
      .createQueryBuilder('price2')
      .select('MAX(price2.priceDate)', 'maxDate')
      .where('price2.productId = product.productId')
      .getQuery();

    const queryBuilder = this.listProductRepository
      .createQueryBuilder('listProduct')
      .leftJoinAndSelect('listProduct.product', 'product')
      .leftJoinAndSelect('product.store', 'store')
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
      grossPrice: listProduct.product.prices[0].grossPrice,
      priceDate: listProduct.product.prices[0].priceDate,
      storeName: listProduct.product.store.name,
      storeStreet: listProduct.product.store.street,
      storeNumber: listProduct.product.store.number,
      storePostalCode: listProduct.product.store.postalCode,
      storeCity: listProduct.product.store.city
    }));
  }

}