export interface ProfileGamificationResponse {
  /** Niveau actuel de l'utilisateur (1–10) */
  level: number;
  /** Total d'XP cumulé */
  xp: number;
  /** XP gagnés au-dessus du palier du niveau actuel */
  xpIntoLevel: number;
  /** XP total de la plage du niveau actuel (0 si niveau 10 max) */
  xpForNextLevel: number;
  /** Nombre de contributions de prix cette semaine */
  weeklyCount: number;
  /** Objectif hebdomadaire (toujours 10) */
  weeklyMax: number;
  /** weekDays[0]=Lundi … weekDays[6]=Dimanche : true si l'utilisateur a contribué ce jour */
  weekDays: boolean[];
  /** true si le cercle hebdomadaire a été complété (≥10 contributions) cette semaine */
  weeklyCircleCompleted: boolean;
}
