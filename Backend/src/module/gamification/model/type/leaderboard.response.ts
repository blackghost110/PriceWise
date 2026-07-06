export type LeaderboardPeriod = 'all' | 'month';

export class LeaderboardEntryResponse {
  userId: string; // = credentialId
  displayName: string;
  codename: string | null; // = activeBadge
  badges: number; // nb de badges débloqués (user_badge)
  level: number; // niveau cumulé (credential.level)
  xp: number; // XP de la période sélectionnée (total si 'all', du mois si 'month')
}
