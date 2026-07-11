export interface ReceiptMatchInfo {
  status: 'existing' | 'new';
  productId: number | null;
  matchedName: string | null;
  confidence: number;
}

export interface ReceiptScanItemResponse {
  rawName: string;
  name: string;
  brand: string;
  unit: 'g' | 'ml' | 'p';
  quantity: number;
  productPrice: number;
  referencePrice: number;
  match: ReceiptMatchInfo;
}
