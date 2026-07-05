export type BadgeTier = 'BRONZE' | 'ARGENT' | 'OR' | 'DIAMANT';

export interface TierProgressDto {
  badgeId: number;
  tierName: string;
  tier: BadgeTier;
  requirementCount: number;
  unlocked: boolean;
}

export interface CategoryProgressDto {
  categoryName: string;
  actionType: string;
  currentCount: number;
  tiers: TierProgressDto[];
  // Premier palier non débloqué, trié par requirementCount croissant. Null si tout est débloqué.
  nextTier: TierProgressDto | null;
}

export interface BadgeOverviewDto {
  categories: CategoryProgressDto[];
  unlockedCount: number;
}
