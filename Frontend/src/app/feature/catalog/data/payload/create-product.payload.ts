import {ProductUnitType} from '@features/catalog/data/dto/product.dto';


export interface CreateProductPayload {
  name: string;
  brand: string;
  unit: ProductUnitType;
  quantity: number;
  initialPrice: number;
  initialReferencePrice: number;
}
