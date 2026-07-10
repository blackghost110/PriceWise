import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BaseEntity } from '@common/model/base.entity';
import { Credential } from '../../../security/model/entity/credential.entity';

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

// Signalement : un utilisateur signale un contenu (magasin/produit/post/commentaire) aux admins.
// targetId n'est volontairement pas une FK car targetType est polymorphe (id numérique ou string
// selon l'entité visée).
@Entity({ name: 'report' })
export class ReportEntity extends BaseEntity {

  @PrimaryGeneratedColumn()
  reportId: number;

  @Column()
  targetType: ReportTargetType;

  @Column()
  targetId: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ default: ReportStatus.PENDING })
  status: ReportStatus;

  // credentialId = l'utilisateur qui signale (le signaleur), pas la cible.
  @Column()
  credentialId: string;

  @ManyToOne(() => Credential)
  @JoinColumn({ name: 'credentialId' })
  credential: Credential;
}
