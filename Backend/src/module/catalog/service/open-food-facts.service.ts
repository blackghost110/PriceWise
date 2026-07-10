import { Injectable, Logger } from '@nestjs/common';
import { ProductUnitType } from '../model/product.entity';
import { ProductLookupException } from '../catalog.exception';
import { ProductLookupResponse } from '../model/type/product-lookup.response';

const OFF_FIELDS = 'product_name,product_name_fr,brands,quantity,product_quantity,product_quantity_unit';
const OFF_BASE_URL = 'https://world.openfoodfacts.org/api/v2/product';

/**
 * Convertit la quantité en texte libre d'Open Food Facts (ex. "1 L", "500 g", "50 cl")
 * vers le format stocké en base (quantity en g/ml, unit = 'g' | 'ml').
 * Retourne null si le texte ne peut pas être interprété (ex. "6 x 33 cl", pièces, format inconnu).
 */
export function parseOffQuantity(raw: string | undefined | null): { quantity: number; unit: ProductUnitType } | null {
  if (!raw) return null;

  const match = raw.trim().toLowerCase().match(/^([\d.,]+)\s*(kg|g|l|cl|dl|ml)\b/);
  if (!match) return null;

  const value = parseFloat(match[1].replace(',', '.'));
  if (!isFinite(value) || value <= 0) return null;

  switch (match[2]) {
    case 'kg':
      return { quantity: Math.round(value * 1000), unit: ProductUnitType.G };
    case 'g':
      return { quantity: Math.round(value), unit: ProductUnitType.G };
    case 'l':
      return { quantity: Math.round(value * 1000), unit: ProductUnitType.ML };
    case 'dl':
      return { quantity: Math.round(value * 100), unit: ProductUnitType.ML };
    case 'cl':
      return { quantity: Math.round(value * 10), unit: ProductUnitType.ML };
    case 'ml':
      return { quantity: Math.round(value), unit: ProductUnitType.ML };
    default:
      return null;
  }
}

@Injectable()
export class OpenFoodFactsService {
  private readonly logger = new Logger(OpenFoodFactsService.name);

  async lookup(ean: string): Promise<ProductLookupResponse> {
    try {
      const response = await fetch(`${OFF_BASE_URL}/${encodeURIComponent(ean)}.json?fields=${OFF_FIELDS}`, {
        headers: { 'User-Agent': 'MonPanierMalin/1.0 (contact: monpanier.malin@gmail.com)' },
      });

      if (!response.ok) {
        // Open Food Facts renvoie normalement du JSON même pour un produit inconnu (status: 0).
        // Une erreur HTTP ici indique un vrai souci réseau / service indisponible.
        throw new Error(`Open Food Facts a répondu ${response.status}`);
      }

      const body = await response.json();

      if (!body || body.status !== 1 || !body.product) {
        return { ean, found: false, name: null, brand: null, quantity: null, unit: null };
      }

      const product = body.product;
      const name: string | null = product.product_name_fr || product.product_name || null;
      const brand: string | null = product.brands ? product.brands.split(',')[0].trim() : null;

      // On tente d'abord le champ texte libre "quantity" (ex. "1 L"), puis le repli structuré
      // product_quantity + product_quantity_unit fourni par Open Food Facts.
      const parsedFromQuantity = parseOffQuantity(product.quantity);
      const parsed =
        parsedFromQuantity ??
        parseOffQuantity(product.product_quantity && product.product_quantity_unit
          ? `${product.product_quantity} ${product.product_quantity_unit}`
          : null);

      return {
        ean,
        found: true,
        name,
        brand,
        quantity: parsed?.quantity ?? null,
        unit: parsed?.unit ?? null,
      };
    } catch (e) {
      this.logger.error(`Échec du lookup Open Food Facts pour l'EAN ${ean}`, e as Error);
      throw new ProductLookupException();
    }
  }
}
