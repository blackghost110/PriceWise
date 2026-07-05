export interface ProfileGamificationDto {
  /** Niveau actuel (1–10) */
  level: number;
  /** Total XP cumulé */
  xp: number;
  /** XP gagnés au-dessus du palier du niveau actuel */
  xpIntoLevel: number;
  /** XP total de la plage du niveau actuel (0 si niveau 10) */
  xpForNextLevel: number;
  /** Contributions de prix cette semaine */
  weeklyCount: number;
  /** Objectif hebdomadaire (10) */
  weeklyMax: number;
  /** weekDays[0]=Lundi … [6]=Dimanche : true si contribution ce jour */
  weekDays: boolean[];
  /** true si ≥ 10 contributions cette semaine (cercle complété) */
  weeklyCircleCompleted: boolean;
}
