import {ProductUnitType} from '@features/catalog/data/dto/product.dto';


export interface UpdateProductPayload {
  name: string;
  brand: string;
  unit: ProductUnitType;
  quantity: number;
  ean?: string;
}
