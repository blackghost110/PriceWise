import { ReportTargetType } from '@features/report/data/dto/report.dto';

export interface ReportDialogDetail {
  label: string;
  value: string;
}

export interface ReportDialogData {
  targetType: ReportTargetType;
  targetId: string;
  label: string;
  /** Informations complètes sur la cible affichées dans le popup (ex. adresse complète d'un magasin). */
  details?: ReportDialogDetail[];
}
