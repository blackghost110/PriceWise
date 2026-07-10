export class AllProductsResponse {
  productId: number;
  name: string;
  brand: string;
  unit: ProductUnitType;
  quantity: number;
  ean: string;
  productPrice: number;
  referencePrice: number;
  priceDate: Date;
  storeName: string;
  storeStreet: string;
  storeNumber: string;
  storePostalCode: string;
  storeCity: string;
  storeBrand: {
    brandId: number;
    name: string;
    textColor: string;
    bgColor: string;
    gradientColor: string | null;
  } | null;
}

export enum ProductUnitType {
  G = 'g',
  ML = 'ml',
  PIECE = 'piece'
}