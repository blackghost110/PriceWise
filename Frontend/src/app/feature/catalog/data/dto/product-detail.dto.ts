import {ProductUnitType} from '@features/catalog/data/dto/product.dto';
import {PriceDto} from '@features/catalog/data/dto/price.dto';

export interface ProductDetailDto {
  productId: number;
  name: string;
  brand: string;
  unit: string;
  quantity: number;
  credentialId: string;

  storeName: string;
  storeStreet: string;
  storeNumber: string;
  storePostalCode: string;
  storeCity: string;

  prices: PriceDto[];
}
