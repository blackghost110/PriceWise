export class AllProductsResponse {
  productId: number;
  name: string;
  brand: string;
  unit: ProductUnitType;
  quantity: number;
  productPrice: number;
  referencePrice: number;
  priceDate: Date;
  storeName: string;
  storeStreet: string;
  storeNumber: string;
  storePostalCode: string;
  storeCity: string;
}

export enum ProductUnitType {
  G = 'g',
  ML = 'ml',
  PIECE = 'piece'
}