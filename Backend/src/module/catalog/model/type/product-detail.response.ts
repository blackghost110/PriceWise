export class ProductDetailResponse {
  productId: number;
  name: string;
  brand: string;
  unit: string;
  quantity: number;

  storeName: string;
  storeStreet: string;
  storeNumber: string;
  storePostalCode: string;
  storeCity: string;

  prices: {
    priceId: number;
    productPrice: number;
    grossPrice: number;
    priceDate: Date;
  }[];

}