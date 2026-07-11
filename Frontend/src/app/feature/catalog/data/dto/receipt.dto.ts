import { ProductUnitType } from '@features/catalog/data/dto/product.dto';

export interface ReceiptMatchDto {
  status: 'existing' | 'new';
  productId: number | null;
  matchedName: string | null;
  confidence: number;
}

export interface ReceiptScanItemDto {
  rawName: string;
  name: string;
  brand: string;
  unit: ProductUnitType;
  quantity: number;
  productPrice: number;
  referencePrice: number;
  match: ReceiptMatchDto;
}

export interface ReceiptApplyResultDto {
  created: number;
  updated: number;
  skipped: number;
}
