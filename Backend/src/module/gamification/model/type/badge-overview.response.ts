import { BadgeActionType, BadgeTier } from '../badge.entity';

export class TierProgress {
  badgeId: number;
  tierName: string;
  tier: BadgeTier;
  requirementCount: number;
  unlocked: boolean;
}

export class CategoryProgress {
  categoryName: string;
  actionType: BadgeActionType;
  currentCount: number;
  tiers: TierProgress[];
  // Premier palier non débloqué, trié par requirementCount croissant. Null si tout est débloqué.
  nextTier: TierProgress | null;
}

export class BadgeOverviewResponse {
  categories: CategoryProgress[];
  unlockedCount: number;
}
