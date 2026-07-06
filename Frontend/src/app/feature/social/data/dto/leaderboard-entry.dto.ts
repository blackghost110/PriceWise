export interface LeaderboardEntryDto {
  userId: string;
  displayName: string;
  codename: string | null;
  badges: number;
  level: number;
  xp: number;
}

export type LeaderboardPeriod = 'all' | 'month';
