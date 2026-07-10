export enum ActionType {
  ADD = 'ADD',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum EntityType {
  STORE = 'STORE',
  PRODUCT = 'PRODUCT',
  PRICE = 'PRICE',
  WEEKLY_CIRCLE = 'WEEKLY_CIRCLE',
}

export interface ActivityLogDto {
  logId: number;
  actionType: ActionType;
  entityType: EntityType;
  entityId: number;
  detail: Record<string, unknown>;
  credentialId: string;
  credential: { displayName: string };
  created: string;
}

export function actionTypeLabel(actionType: ActionType): string {
  switch (actionType) {
    case ActionType.ADD:
      return 'a ajouté';
    case ActionType.UPDATE:
      return 'a modifié';
    case ActionType.DELETE:
      return 'a supprimé';
    default:
      return actionType;
  }
}

export function entityTypeLabel(entityType: EntityType): string {
  switch (entityType) {
    case EntityType.STORE:
      return 'un magasin';
    case EntityType.PRODUCT:
      return 'un produit';
    case EntityType.PRICE:
      return 'un prix';
    case EntityType.WEEKLY_CIRCLE:
      return 'un cercle hebdomadaire';
    default:
      return entityType;
  }
}
