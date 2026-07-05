// Paliers cumulés d'XP nécessaires pour chaque niveau (index i = niveau i+1).
// Ex : XP_THRESHOLDS[1] = 50 → il faut 50 XP au total pour atteindre le niveau 2.
export const XP_THRESHOLDS = [0, 50, 150, 350, 700, 1500, 3000, 5000, 8000, 15000];

// XP accordés par type d'action
export const XP_REWARDS = {
  ADD_STORE: 10,
  ADD_PRODUCT: 3,
  ADD_PRICE: 1,
  WEEKLY_CIRCLE: 20,
};

// Nombre de contributions de prix hebdomadaires pour valider le cercle
export const WEEKLY_CIRCLE_GOAL = 10;

/**
 * Retourne le niveau (1–10) correspondant à un total d'XP cumulé.
 * Le niveau est le plus élevé dont le palier est ≤ totalXp.
 */
export function levelForXp(totalXp: number): number {
  let level = 1;
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (totalXp >= XP_THRESHOLDS[i]) {
      level = i + 1;
      break;
    }
  }
  return level;
}
