import {ProductUnitType} from '@features/catalog/data/dto/product.dto';
import {StoreBrandDto} from '@features/catalog/data/dto/store-brand.dto';

export interface ProductsAllDto {

  productId: number;
  name: string;
  brand: string;
  unit: ProductUnitType;
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
