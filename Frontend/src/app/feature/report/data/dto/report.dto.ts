export enum ReportTargetType {
  STORE = 'STORE',
  PRODUCT = 'PRODUCT',
  POST = 'POST',
  COMMENT = 'COMMENT',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED',
}

export interface ReportDto {
  reportId: number;
  targetType: ReportTargetType;
  targetId: string;
  description: string;
  status: ReportStatus;
  created: string;
  credentialId: string;
  credential: { displayName: string };
}

/** Libellé FR pour affichage (badges/filtres admin). */
export function reportTargetTypeLabel(targetType: ReportTargetType): string {
  switch (targetType) {
    case ReportTargetType.STORE:
      return 'Magasin';
    case ReportTargetType.PRODUCT:
      return 'Produit';
    case ReportTargetType.POST:
      return 'Discussion';
    case ReportTargetType.COMMENT:
      return 'Commentaire';
    default:
      return targetType;
  }
}
