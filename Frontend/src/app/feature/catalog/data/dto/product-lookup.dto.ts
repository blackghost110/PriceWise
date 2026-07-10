import { ProductUnitType } from '@features/catalog/data/dto/product.dto';

export interface ProductLookupDto {
  ean: string;
  found: boolean;
  name: string | null;
  brand: string | null;
  quantity: number | null;
  unit: ProductUnitType | null;
}
