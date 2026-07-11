/**
 * Recherche approximative servant à relier une ligne détectée sur un ticket de caisse (nom souvent
 * abrégé/tronqué par la caisse) à un produit déjà connu DU MÊME MAGASIN.
 *
 * Le scan est toujours borné à un magasin (voir ReceiptService.scan), donc on compare contre une
 * poignée de produits seulement : un scoring par recouvrement de tokens (Jaccard) en mémoire est
 * largement suffisant et évite d'introduire une dépendance à une extension Postgres (pg_trgm).
 */

export interface MatchCandidate {
  productId: number;
  name: string;
  brand: string;
}

export interface MatchResult {
  productId: number | null;
  matchedName: string | null;
  confidence: number;
}

const MATCH_THRESHOLD = 0.5;

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // retire les accents (diacritiques combinants après normalize('NFD'))
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalize(text).split(' ').filter(Boolean);
}

function scoreCandidate(detectedName: string, detectedBrand: string, candidate: MatchCandidate): number {
  const detectedTokens = new Set(tokenize(`${detectedName} ${detectedBrand}`));
  const candidateTokens = new Set(tokenize(`${candidate.name} ${candidate.brand}`));
  if (detectedTokens.size === 0 || candidateTokens.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of detectedTokens) {
    if (candidateTokens.has(token)) intersection++;
  }
  const union = new Set([...detectedTokens, ...candidateTokens]).size;
  let score = intersection / union;

  // Bonus si un des deux noms (une fois normalisé) est inclus tel quel dans l'autre : couvre le cas
  // fréquent d'un nom de ticket tronqué qui reste un sous-mot du nom complet en base (ou l'inverse).
  const normDetected = normalize(detectedName);
  const normCandidate = normalize(candidate.name);
  if (normDetected && normCandidate && (normDetected.includes(normCandidate) || normCandidate.includes(normDetected))) {
    score = Math.min(1, score + 0.2);
  }

  return score;
}

export function matchReceiptItem(detectedName: string, detectedBrand: string, candidates: MatchCandidate[]): MatchResult {
  let best: { candidate: MatchCandidate; score: number } | null = null;

  for (const candidate of candidates) {
    const score = scoreCandidate(detectedName, detectedBrand, candidate);
    if (!best || score > best.score) {
      best = { candidate, score };
    }
  }

  if (!best || best.score < MATCH_THRESHOLD) {
    return { productId: null, matchedName: null, confidence: best ? Math.round(best.score * 100) / 100 : 0 };
  }

  return {
    productId: best.candidate.productId,
    matchedName: best.candidate.name,
    confidence: Math.round(best.score * 100) / 100,
  };
}

/**
 * Filet de sécurité si l'IA n'a pas fusionné deux lignes identiques (ex. 3x le même fromage au même
 * prix) : on considère deux lignes comme des doublons si leur nom, marque et prix unitaire coïncident.
 */
export function isDuplicateItem(
  a: { name: string; brand: string; unitPrice: number },
  b: { name: string; brand: string; unitPrice: number },
): boolean {
  return (
    normalize(a.name) === normalize(b.name) &&
    normalize(a.brand) === normalize(b.brand) &&
    Math.abs(a.unitPrice - b.unitPrice) < 0.005
  );
}
