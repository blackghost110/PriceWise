import { ApiException } from '@common/api/exception/api.exception';
import { ApiCodeResponse } from '@common/api/data/api-code.response';

// Badge Service Exceptions ------------------------------------------------------//

export class BadgeOverviewException extends ApiException {
  constructor() {
    super(ApiCodeResponse.BADGE_OVERVIEW_EXCEPTION, 500);
  }
}

export class BadgeSetActiveNotUnlockedException extends ApiException {
  constructor() {
    super(ApiCodeResponse.BADGE_SET_ACTIVE_NOT_UNLOCKED_EXCEPTION, 403);
  }
}

export class BadgeSetActiveException extends ApiException {
  constructor() {
    super(ApiCodeResponse.BADGE_SET_ACTIVE_EXCEPTION, 500);
  }
}

// XP / Profile Exceptions ------------------------------------------------------//

export class GamificationProfileException extends ApiException {
  constructor() {
    super(ApiCodeResponse.GAMIFICATION_PROFILE_EXCEPTION, 500);
  }
}

// Leaderboard Exceptions ------------------------------------------------------//

export class LeaderboardGetException extends ApiException {
  constructor() {
    super(ApiCodeResponse.GAMIFICATION_LEADERBOARD_EXCEPTION, 500);
  }
}
