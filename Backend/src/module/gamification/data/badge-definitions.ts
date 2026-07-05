import { BadgeActionType, BadgeTier } from '../model/badge.entity';

export interface BadgeDefinition {
  categoryName: string;
  actionType: BadgeActionType;
  tier: BadgeTier;
  tierName: string;
  requirementCount: number;
}

// Catalogue figé des 36 succès (9 catégories x 4 paliers). Seedé en base au démarrage par
// BadgeSeederService - modifier ce tableau ne met pas à jour les lignes déjà insérées.
export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Cartographe - ajouter des magasins
  { categoryName: 'Cartographe', actionType: BadgeActionType.ADD_STORE, tier: BadgeTier.BRONZE, tierName: 'Oeuf mollet', requirementCount: 1 },
  { categoryName: 'Cartographe', actionType: BadgeActionType.ADD_STORE, tier: BadgeTier.ARGENT, tierName: 'Omelette baveuse', requirementCount: 5 },
  { categoryName: 'Cartographe', actionType: BadgeActionType.ADD_STORE, tier: BadgeTier.OR, tierName: 'Oeuf Cent Ans', requirementCount: 10 },
  { categoryName: 'Cartographe', actionType: BadgeActionType.ADD_STORE, tier: BadgeTier.DIAMANT, tierName: "Oeuf d'Or Imperial", requirementCount: 25 },

  // Sourceur - ajouter des produits
  { categoryName: 'Sourceur', actionType: BadgeActionType.ADD_PRODUCT, tier: BadgeTier.BRONZE, tierName: 'Tartare cru', requirementCount: 10 },
  { categoryName: 'Sourceur', actionType: BadgeActionType.ADD_PRODUCT, tier: BadgeTier.ARGENT, tierName: 'Filet tendre', requirementCount: 50 },
  { categoryName: 'Sourceur', actionType: BadgeActionType.ADD_PRODUCT, tier: BadgeTier.OR, tierName: 'Entrecote maturée', requirementCount: 150 },
  { categoryName: 'Sourceur', actionType: BadgeActionType.ADD_PRODUCT, tier: BadgeTier.DIAMANT, tierName: 'Boeuf wagyu legendaire', requirementCount: 500 },

  // Chroniqueur - ajouter des prix
  { categoryName: 'Chroniqueur', actionType: BadgeActionType.ADD_PRICE, tier: BadgeTier.BRONZE, tierName: 'Poivre doux', requirementCount: 25 },
  { categoryName: 'Chroniqueur', actionType: BadgeActionType.ADD_PRICE, tier: BadgeTier.ARGENT, tierName: 'Flambée fumée', requirementCount: 100 },
  { categoryName: 'Chroniqueur', actionType: BadgeActionType.ADD_PRICE, tier: BadgeTier.OR, tierName: 'Piment volcanique', requirementCount: 500 },
  { categoryName: 'Chroniqueur', actionType: BadgeActionType.ADD_PRICE, tier: BadgeTier.DIAMANT, tierName: 'Souffle du dragon celeste', requirementCount: 2000 },

  // Baron - créateur d'un magasin populaire (nb de produits)
  { categoryName: 'Baron', actionType: BadgeActionType.STORE_POPULARITY, tier: BadgeTier.BRONZE, tierName: 'Caillé frais', requirementCount: 10 },
  { categoryName: 'Baron', actionType: BadgeActionType.STORE_POPULARITY, tier: BadgeTier.ARGENT, tierName: 'Camembert coulant', requirementCount: 25 },
  { categoryName: 'Baron', actionType: BadgeActionType.STORE_POPULARITY, tier: BadgeTier.OR, tierName: 'Roquefort puissant', requirementCount: 70 },
  { categoryName: 'Baron', actionType: BadgeActionType.STORE_POPULARITY, tier: BadgeTier.DIAMANT, tierName: 'Gouda noir centenaire', requirementCount: 100 },

  // Boussole - créateur d'un produit populaire (nb de prix)
  { categoryName: 'Boussole', actionType: BadgeActionType.PRODUCT_POPULARITY, tier: BadgeTier.BRONZE, tierName: 'Cafe instantané', requirementCount: 5 },
  { categoryName: 'Boussole', actionType: BadgeActionType.PRODUCT_POPULARITY, tier: BadgeTier.ARGENT, tierName: 'Grain Torrefié', requirementCount: 15 },
  { categoryName: 'Boussole', actionType: BadgeActionType.PRODUCT_POPULARITY, tier: BadgeTier.OR, tierName: 'Expresso Corsé', requirementCount: 50 },
  { categoryName: 'Boussole', actionType: BadgeActionType.PRODUCT_POPULARITY, tier: BadgeTier.DIAMANT, tierName: "Or noir d'arabica", requirementCount: 100 },

  // Inoxydable - valider le cercle hebdomadaire (fonctionnalité non implémentée)
  { categoryName: 'Inoxydable', actionType: BadgeActionType.WEEKLY_CIRCLE, tier: BadgeTier.BRONZE, tierName: 'Cire brut', requirementCount: 3 },
  { categoryName: 'Inoxydable', actionType: BadgeActionType.WEEKLY_CIRCLE, tier: BadgeTier.ARGENT, tierName: 'Pollen sauvage', requirementCount: 10 },
  { categoryName: 'Inoxydable', actionType: BadgeActionType.WEEKLY_CIRCLE, tier: BadgeTier.OR, tierName: 'Miel noir', requirementCount: 25 },
  { categoryName: 'Inoxydable', actionType: BadgeActionType.WEEKLY_CIRCLE, tier: BadgeTier.DIAMANT, tierName: 'Source de nectar eternel', requirementCount: 50 },

  // Nomade - ajouter des prix dans des codes postaux différents
  { categoryName: 'Nomade', actionType: BadgeActionType.ADD_POSTAL_CODE, tier: BadgeTier.BRONZE, tierName: 'Spore curieux', requirementCount: 2 },
  { categoryName: 'Nomade', actionType: BadgeActionType.ADD_POSTAL_CODE, tier: BadgeTier.ARGENT, tierName: 'Champignon voyageur', requirementCount: 5 },
  { categoryName: 'Nomade', actionType: BadgeActionType.ADD_POSTAL_CODE, tier: BadgeTier.OR, tierName: 'Truffe noire', requirementCount: 10 },
  { categoryName: 'Nomade', actionType: BadgeActionType.ADD_POSTAL_CODE, tier: BadgeTier.DIAMANT, tierName: 'Amanite de sorcière noire', requirementCount: 20 },

  // Plume - écrire des messages sur le forum (posts + commentaires)
  { categoryName: 'Plume', actionType: BadgeActionType.FORUM_POST, tier: BadgeTier.BRONZE, tierName: 'Tomate cerise', requirementCount: 2 },
  { categoryName: 'Plume', actionType: BadgeActionType.FORUM_POST, tier: BadgeTier.ARGENT, tierName: 'Tomate grappe', requirementCount: 25 },
  { categoryName: 'Plume', actionType: BadgeActionType.FORUM_POST, tier: BadgeTier.OR, tierName: 'Coeur de boeuf', requirementCount: 100 },
  { categoryName: 'Plume', actionType: BadgeActionType.FORUM_POST, tier: BadgeTier.DIAMANT, tierName: 'Sang rouge absolu', requirementCount: 500 },

  // Sniper - signaler des prix en forte baisse (fonctionnalité non implémentée)
  { categoryName: 'Sniper', actionType: BadgeActionType.REPORT_PRICE_DROP, tier: BadgeTier.BRONZE, tierName: 'Goutte acide', requirementCount: 1 },
  { categoryName: 'Sniper', actionType: BadgeActionType.REPORT_PRICE_DROP, tier: BadgeTier.ARGENT, tierName: 'Cristal citrique', requirementCount: 5 },
  { categoryName: 'Sniper', actionType: BadgeActionType.REPORT_PRICE_DROP, tier: BadgeTier.OR, tierName: 'Pulpe givrée', requirementCount: 20 },
  { categoryName: 'Sniper', actionType: BadgeActionType.REPORT_PRICE_DROP, tier: BadgeTier.DIAMANT, tierName: "Morsure d'agrume Légendaire", requirementCount: 50 },
];
