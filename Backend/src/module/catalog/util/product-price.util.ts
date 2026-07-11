/**
 * Calcule le prix normalisé (prix "brut" : €/kg, €/L, ou €/pièce) à partir du prix unitaire,
 * de la quantité et de l'unité d'un produit.
 *
 * Port côté backend de `computeReferencePrice` (Frontend/src/app/feature/catalog/data/dto/product.dto.ts) —
 * garder les deux implémentations synchronisées. Utilisé uniquement par le scan de ticket de caisse :
 * en dehors de ce flux, `referencePrice` continue d'être fourni tel quel par le client (voir mémoire
 * "aucun calcul de prix brut n'existe côté backend" — product.service.ts / price.service.ts).
 */
export function computeReferencePrice(unitPrice: number, quantity: number, unit: string): number {
  if (!unit || !unitPrice || !quantity || unitPrice <= 0 || quantity <= 0) {
    return unitPrice;
  }
  const factor = unit === 'g' || unit === 'ml' ? 1000 : 1;
  return Math.round((unitPrice / quantity) * factor * 100) / 100;
}
