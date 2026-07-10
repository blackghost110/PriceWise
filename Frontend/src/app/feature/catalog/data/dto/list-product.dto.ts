import {StoreBrandDto} from '@features/catalog/data/dto/store-brand.dto';

export interface ListProductDto {
  created: Date;
  listProductId: number;

  productId: number;
  name: string;
  brand: string;
  unit: string;
  quantity: number;
  productPrice: number;
  referencePrice: number;
  priceDate: Date;
  storeName: string;
  storeStreet: string;
  storeNumber: string;
  storePostalCode: string;
  storeCity: string;
  storeBrand: StoreBrandDto | null;
}
