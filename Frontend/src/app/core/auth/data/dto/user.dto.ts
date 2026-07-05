export interface UserDto {
  credentialId: string;
  displayName: string;
  email: string;
  role: string;
  level: number;
  xp: number;
  activeBadge: string | null;
  warningCount: number;
  weeklyCircle: number;
}
