import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { StoreEntity } from '../model/store.entity';
import { ProductEntity } from '../model/product.entity';
import { CreateStoreDto } from '../model/dto/create-store.dto';
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

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(StoreEntity)
    private readonly storeRepository: Repository<StoreEntity>,
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
    @InjectRepository(PriceEntity)
    private readonly priceRepository: Repository<PriceEntity>,
  ) {}

  async createStore(createStoreDto: CreateStoreDto) {
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
      return await this.storeRepository.save(store);
    } catch (e) {
      throw new StoreCreateException();
    }
  }

  async findAll(): Promise<StoreEntity[]> {
    try {
      return await this.storeRepository.find();
    } catch (e) {
      throw new StoreFindAllException();
    }
  }

  async findTwoLast(): Promise<StoreEntity[]> {
    try {
      return await this.storeRepository.find({
        order: { created: 'DESC' },
        take: 2,
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
        grossPrice: product.prices[0].grossPrice,
        priceDate: product.prices[0].priceDate,
      }));
    } catch (e) {
      throw new StoreGetProductsException();
    }

  }

  // ----- verifier cette fonction CORRIGER LES EXCEPTIONS
  async deleteStore(storeId: number): Promise<void> {
    const store = await this.storeRepository.findOne({
      where: { storeId } });
    if (!store) {
      throw new ListDeleteNotFoundException();
    }
    try {
      await this.storeRepository.remove(store);
    } catch (e) {
      throw new ListDeleteException();
    }
  }

  async updateStore(dto: UpdateStoreDto, storeId: number) {
    // Vérification que le store existe
    const store = await this.storeRepository.findOne({ where: { storeId } });
    if (!store) {
      throw new StoreUpdateNotFoundException();
    }

    try {
      // Mise à jour des champs
      store.name = dto.name;
      store.street = dto.street;
      store.number = dto.number;
      store.postalCode = dto.postalCode;
      store.city = dto.city;

      return await this.storeRepository.save(store);

    } catch (e) {
      throw new StoreUpdateException();
    }
  }

}
