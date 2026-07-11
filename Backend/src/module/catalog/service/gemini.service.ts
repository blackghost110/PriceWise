import { Injectable, Logger } from '@nestjs/common';
import { configManager } from '@common/config/config.manager';
import { ReceiptScanConfigException, ReceiptScanException } from '../catalog.exception';

// NB : 'gemini-2.5-flash' (le modèle initialement prévu) renvoie 404 "no longer available to new
// users" pour un compte Google AI Studio récent, et 'gemini-2.0-flash' a un quota gratuit à 0 pour
// ce type de compte (vérifié en direct sur la clé de ce projet). 'gemini-3.1-flash-lite' est le
// modèle stable (non-preview) actuellement accessible en free tier qui gère à la fois le JSON
// structuré (responseSchema) et l'entrée image (inline_data) — voir vérifications manuelles dans
// la conversation d'implémentation. Si Google fait évoluer sa gamme, ajuster cette constante.
const GEMINI_MODEL = 'gemini-3.1-flash-lite';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export interface GeminiReceiptItem {
  rawName: string;
  name: string;
  brand: string;
  unit: 'g' | 'ml' | 'p';
  quantity: number;
  unitPrice: number;
}

// NB : l'unité "pièce" est stockée comme 'p' dans toute l'application (voir ProductEntity.unit /
// CreateProductDto.unit, sans @IsEnum), même si l'enum TS ProductUnitType.PIECE déclare 'piece'
// par erreur. On force donc explicitement l'IA à répondre avec 'g' | 'ml' | 'p'.
const RECEIPT_PROMPT = `Tu es un assistant qui lit des tickets de caisse de supermarché (photo ou scan) et qui en extrait la liste des articles achetés, au format JSON strict conforme au schéma fourni.

Pour chaque article réellement acheté (ignore les lignes de total, sous-total, TVA, monnaie rendue, carte de fidélité, mode de paiement) :
- "rawName" : le texte brut de la ligne tel qu'imprimé sur le ticket (souvent abrégé/tronqué).
- "name" : le nom complet et probable du produit, en français, en développant les abréviations courantes de ticket de caisse (ex. "YAOURT NAT" → "Yaourt nature", "PQ TOMATE" → "Tomates").
- "brand" : la marque si elle est identifiable dans le texte, sinon une chaîne vide "".
- "unit" : "g" si le produit est vendu au poids, "ml" si vendu au volume, "p" si vendu à la pièce (unité indivisible, sans poids/volume précisé). Utilise "p" par défaut si tu ne peux pas déterminer.
- "quantity" : le contenu d'UN SEUL exemplaire du produit tel qu'il est normalement vendu (ex. 500 pour un pot de 500g, 1 pour un article vendu à la pièce comme une compote individuelle). Ce N'EST JAMAIS le nombre d'exemplaires achetés sur ce ticket, même si le même article a été acheté plusieurs fois.
- "unitPrice" : le prix d'UN SEUL exemplaire du produit tel que défini ci-dessus, en euros, après application d'une éventuelle remise visible sur le ticket pour cette ligne.

RÈGLE — produits vendus en vrac / au poids variable (fruits, légumes, fromage à la coupe, etc. : le poids réellement pesé varie à chaque achat, souvent accompagné d'un prix au kg/L sur le ticket) :
Ne renvoie JAMAIS le poids réellement pesé ni le prix total payé pour ce poids précis. Renvoie toujours "unit":"g" (ou "ml" pour un liquide en vrac), "quantity":1000, et "unitPrice" = le prix normalisé au kilo/litre (le prix "€/kg" ou "€/L" affiché sur le ticket, ou calculé en divisant le prix total payé par le poids réellement pesé en kg).
Exemple : le ticket affiche "POIVRON ROUGE 0.230 kg x 2.35€/kg = 0.54€" → réponds {"name":"Poivron rouge","unit":"g","quantity":1000,"unitPrice":2.35}. NE PAS renvoyer quantity:230 ni unitPrice:0.54.

RÈGLE — articles achetés plusieurs fois : si le même article identique apparaît plusieurs fois sur le ticket (plusieurs lignes séparées au même prix, ou une ligne du type "3 x 1.55"), fusionne en UNE SEULE entrée qui décrit UN SEUL exemplaire : garde le "quantity" normal du produit (ex. 1 pour un article à la pièce) et "unitPrice" = le prix d'UN SEUL exemplaire. Ne multiplie et ne divise JAMAIS ce prix par le nombre d'exemplaires achetés.
Exemple : le ticket affiche trois fois la ligne "COMPOTE POMME 1.55" (donc 3 compotes achetées séparément à 1.55€ pièce) → réponds une seule entrée {"name":"Compote de pomme","unit":"p","quantity":1,"unitPrice":1.55}. NE PAS renvoyer quantity:3, et NE PAS renvoyer unitPrice:4.65 ni unitPrice:0.52.

Réponds UNIQUEMENT avec le JSON demandé, aucun texte autour.`;

const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      rawName: { type: 'STRING', description: 'Texte brut de la ligne du ticket' },
      name: { type: 'STRING', description: 'Nom complet et développé du produit, en français' },
      brand: { type: 'STRING', description: 'Marque si identifiable, sinon chaîne vide' },
      unit: { type: 'STRING', enum: ['g', 'ml', 'p'] },
      quantity: {
        type: 'NUMBER',
        description:
          "Contenu d'UN SEUL exemplaire du produit tel que normalement vendu, jamais le nombre d'exemplaires achetés sur ce ticket. Toujours 1000 pour un article vendu en vrac au poids (fruits, légumes, fromage à la coupe...).",
      },
      unitPrice: {
        type: 'NUMBER',
        description:
          "Prix d'UN SEUL exemplaire (ou prix normalisé au kg/L pour un article en vrac), jamais un total pour plusieurs exemplaires achetés.",
      },
    },
    required: ['rawName', 'name', 'brand', 'unit', 'quantity', 'unitPrice'],
  },
};

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  async scanReceipt(imageBase64: string, mimeType: string): Promise<GeminiReceiptItem[]> {
    const apiKey = configManager.getGeminiApiKey();
    if (!apiKey) {
      throw new ReceiptScanConfigException();
    }

    try {
      const response = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: RECEIPT_PROMPT }, { inline_data: { mime_type: mimeType, data: imageBase64 } }],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        throw new Error(`Gemini a répondu ${response.status} : ${errBody}`);
      }

      const body = await response.json();
      const text = body?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) {
        throw new Error('Réponse Gemini vide ou de forme inattendue');
      }

      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) {
        throw new Error("Le JSON renvoyé par Gemini n'est pas un tableau");
      }

      return parsed
        .filter((item) => item && typeof item.name === 'string' && Number(item.unitPrice) > 0)
        .map((item) => ({
          rawName: String(item.rawName ?? item.name),
          name: String(item.name).trim(),
          brand: item.brand ? String(item.brand).trim() : '',
          unit: (['g', 'ml', 'p'].includes(item.unit) ? item.unit : 'p') as 'g' | 'ml' | 'p',
          quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
          unitPrice: Math.round(Number(item.unitPrice) * 100) / 100,
        }));
    } catch (e) {
      this.logger.error('Échec du scan de ticket via Gemini', e as Error);
      throw new ReceiptScanException();
    }
  }
}
