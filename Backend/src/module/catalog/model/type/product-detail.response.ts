export class ProductDetailResponse {
  productId: number;
  name: string;
  brand: string;
  unit: string;
  quantity: number;
  ean: string;
  credentialId: string;

  storeName: string;
  storeStreet: string;
  storeNumber: string;
  storePostalCode: string;
  storeCity: string;

  prices: {
    priceId: number;
    productPrice: number;
    referencePrice: number;
    priceDate: Date;
  }[];

}