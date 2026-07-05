export class StoreProductsResponse {
  productId: number;
  name: string;
  brand: string;
  unit: ProductUnitType;
  quantity: number;
  productPrice: number;
  referencePrice: number;
  priceDate: Date;
}

export enum ProductUnitType {
  G = 'g',
  ML = 'ml',
  PIECE = 'piece'
}