import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@common/model/base.entity';
import { Credential } from '../../../security/model/entity/credential.entity';

export enum ActionType {
  ADD = 'ADD',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export enum EntityType {
  STORE = 'STORE',
  PRODUCT = 'PRODUCT',
  PRICE = 'PRICE',
  // Complétion d'un cercle hebdomadaire (+20 XP) — pas d'entité propre, entityId = 0.
  WEEKLY_CIRCLE = 'WEEKLY_CIRCLE',
}

// Journal d'activité : trace chaque mutation (ADD/UPDATE/DELETE) faite sur les
// entités du catalogue (magasins, produits, prix). Écrit en best-effort depuis
// les services catalog (cf. ActivityLogService), ne bloque jamais l'action.
@Entity({ name: 'activity_log' })
export class ActivityLogEntity extends BaseEntity {

  @PrimaryGeneratedColumn()
  logId: number;

  @Column()
  actionType: ActionType;

  @Column()
  entityType: EntityType;

  // Id de l'entité concernée (store/product/price) — volontairement pas une FK
  // car polymorphe selon entityType.
  @Column()
  entityId: number;

  // Pour ADD/DELETE : { id }. Pour UPDATE : { id, before, after }.
  @Column({ type: 'jsonb' })
  detail: Record<string, unknown>;

  @Column()
  credentialId: string;

  @ManyToOne(() => Credential)
  @JoinColumn({ name: 'credentialId' })
  credential: Credential;
}
