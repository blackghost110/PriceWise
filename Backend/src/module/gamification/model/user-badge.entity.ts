import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Credential } from '../../../security/model/entity/credential.entity';
import { BadgeEntity } from './badge.entity';

// Liaison 0,n - 0,n entre Credential et Badge : mémorise les badges débloqués par chaque utilisateur
@Entity({ name: 'user_badge' })
export class UserBadgeEntity {

  @PrimaryColumn()
  credentialId: string;

  @PrimaryColumn()
  badgeId: number;

  @ManyToOne(() => Credential)
  @JoinColumn({ name: 'credentialId' })
  credential: Credential;

  @ManyToOne(() => BadgeEntity)
  @JoinColumn({ name: 'badgeId' })
  badge: BadgeEntity;

  @CreateDateColumn()
  unlockedAt: Date;
}
