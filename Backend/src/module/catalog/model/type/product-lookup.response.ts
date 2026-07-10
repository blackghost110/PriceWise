import { ProductUnitType } from '../product.entity';

export class ProductLookupResponse {
  ean: string;
  found: boolean;
  name: string | null;
  brand: string | null;
  quantity: number | null;
  unit: ProductUnitType | null;
}
