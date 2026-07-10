export interface ProductDto {

  productId: number;
  name: string;
  brand: string;
  unit: ProductUnitType;
  quantity: number;
  ean?: string;
  productPrice: number;
  referencePrice: number;
  priceDate: Date;

}

export enum ProductUnitType {
  G = 'g',
  ML = 'ml',
  PIECE = 'p'
}

export function referencePriceUnitLabel(unit: string): string {
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

/**
 * Formate la quantité affichée d'un produit dans l'unité la plus lisible : kg/l pour les
 * multiples de 500 (g/ml), cl pour les multiples de 10 (ml uniquement), sinon la valeur brute.
 */
export function formatQuantity(quantity: number, unit: string): string {
  if (unit === ProductUnitType.G) {
    if (quantity % 500 === 0) {
      return `${quantity / 1000} kg`;
    }
    return `${quantity}g`;
  }
  if (unit === ProductUnitType.ML) {
    if (quantity % 500 === 0) {
      return `${quantity / 1000} l`;
    }
    if (quantity % 10 === 0) {
      return `${quantity / 10} cl`;
    }
    return `${quantity}ml`;
  }
  return `${quantity}${unit}`;
}

/**
 * Calcule le prix normalisé (referencePrice) à partir du prix, de la quantité et de l'unité
 * du produit. Les produits sont stockés en grammes / millilitres / pièces ; on normalise donc
 * au kilo, au litre, ou à la pièce.
 * Retourne `null` si le calcul n'est pas possible (valeurs manquantes ou invalides).
 */
export function computeReferencePrice(
  productPrice: number | null | undefined,
  quantity: number | null | undefined,
  unit: string | null | undefined,
): number | null {
  const price = Number(productPrice);
  const qty = Number(quantity);
  if (!unit || !price || !qty || price <= 0 || qty <= 0) return null;
  const factor = (unit === ProductUnitType.G || unit === ProductUnitType.ML) ? 1000 : 1;
  return Math.round((price / qty) * factor * 100) / 100;
}
