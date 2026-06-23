export interface ProductDto {

  productId: number;
  name: string;
  brand: string;
  unit: ProductUnitType;
  quantity: number;
  productPrice: number;
  grossPrice: number;
  priceDate: Date;

}

export enum ProductUnitType {
  G = 'g',
  ML = 'ml',
  PIECE = 'p'
}

export function grossPriceUnitLabel(unit: string): string {
  switch (unit) {
    case ProductUnitType.G:
      return 'Kg';
    case ProductUnitType.ML:
      return 'L';
    case ProductUnitType.PIECE:
      return 'P';
    default:
      return unit;
  }
}
