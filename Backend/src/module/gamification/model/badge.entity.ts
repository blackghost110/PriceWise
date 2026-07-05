import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { BaseEntity } from '@common/model/base.entity';

// Action privée associée en base de données : sert à choisir la requête de comptage à exécuter
export enum BadgeActionType {
  ADD_STORE = 'ADD_STORE',
  ADD_PRODUCT = 'ADD_PRODUCT',
  ADD_PRICE = 'ADD_PRICE',
  STORE_POPULARITY = 'STORE_POPULARITY',
  PRODUCT_POPULARITY = 'PRODUCT_POPULARITY',
  WEEKLY_CIRCLE = 'WEEKLY_CIRCLE',
  ADD_POSTAL_CODE = 'ADD_POSTAL_CODE',
  FORUM_POST = 'FORUM_POST',
  REPORT_PRICE_DROP = 'REPORT_PRICE_DROP',
}

export enum BadgeTier {
  BRONZE = 'BRONZE',
  ARGENT = 'ARGENT',
  OR = 'OR',
  DIAMANT = 'DIAMANT',
}

// Catalogue des succès disponibles (36 lignes seedées au démarrage, cf. BadgeSeederService)
@Entity({ name: 'badge' })
@Unique(['categoryName', 'tier'])
export class BadgeEntity extends BaseEntity {

  @PrimaryGeneratedColumn()
  badgeId: number;

  // Petit indice affiché (ex: "Cartographe")
  @Column()
  categoryName: string;

  // Nom de code du succès pour ce palier (ex: "Spore curieux")
  @Column()
  tierName: string;

  @Column()
  actionType: BadgeActionType;

  // Rareté du palier
  @Column()
  tier: BadgeTier;

  // Seuil requis pour débloquer ce palier
  @Column()
  requirementCount: number;
}
