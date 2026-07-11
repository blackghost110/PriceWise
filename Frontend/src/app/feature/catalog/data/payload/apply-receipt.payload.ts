import { ProductUnitType } from '@features/catalog/data/dto/product.dto';

export interface ApplyReceiptItemPayload {
  productId?: number | null;
  name: string;
  brand: string;
  unit: ProductUnitType;
  quantity: number;
  productPrice: number;
  referencePrice: number;
}

export interface ApplyReceiptPayload {
  items: ApplyReceiptItemPayload[];
}
