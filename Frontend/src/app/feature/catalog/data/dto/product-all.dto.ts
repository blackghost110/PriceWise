import {ProductUnitType} from '@features/catalog/data/dto/product.dto';

export interface ProductAllDto {

  productId: number;
  name: string;
  brand: string;
  unit: ProductUnitType;
  quantity: number;
  productPrice: number;
  grossPrice: number;
  priceDate: Date;
  storeName: string;
  storeStreet: string;
  storeNumber: string;
  storePostalCode: string;
  storeCity: string;
}
