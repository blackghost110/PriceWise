// Palette cyclique assignée par seed (nom d'utilisateur) pour le dégradé d'avatar placeholder.
// Reprend le pattern défini dans la page Classement (leaderboard.ts).
const AVATAR_PALETTE = ['#c8704a', '#5b8dd9', '#43a047', '#8e63c9', '#e0a03c', '#3caea3', '#d16b8f'];

/**
 * Initiales (1 à 2 lettres) générées à partir d'un nom affiché.
 * Ex. "Marie Lambert" -> "ML"
 */
export function initials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Dégradé de fond déterministe pour un avatar placeholder, dérivé d'un seed
 * (ex. displayName, en l'absence d'un identifiant stable côté DTO).
 */
export function avatarGradient(seed: string): string {
  const color = avatarColor(seed);
  return `linear-gradient(145deg, ${color}, ${color}cc)`;
}

function avatarColor(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}
