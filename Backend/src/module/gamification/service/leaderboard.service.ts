import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Credential } from '../../../security/model/entity/credential.entity';
import { ActionType, ActivityLogEntity, EntityType } from '../../activity-log/model/activity-log.entity';
import { XP_REWARDS } from '../data/xp.constants';
import { LeaderboardEntryResponse, LeaderboardPeriod } from '../model/type/leaderboard.response';
import { LeaderboardGetException } from '../gamification.exception';

// Poids XP par type d'entité journalisée dans activity_log — utilisé pour reconstituer
// l'XP gagné sur une période (le classement mensuel n'a pas d'historique XP dédié).
const XP_WEIGHT_BY_ENTITY_TYPE: Record<string, number> = {
  [EntityType.STORE]: XP_REWARDS.ADD_STORE,
  [EntityType.PRODUCT]: XP_REWARDS.ADD_PRODUCT,
  [EntityType.PRICE]: XP_REWARDS.ADD_PRICE,
  [EntityType.WEEKLY_CIRCLE]: XP_REWARDS.WEEKLY_CIRCLE,
};

interface BaseRow {
  userId: string;
  displayName: string;
  codename: string | null;
  level: string | number;
  totalXp: string | number;
  badges: string | number;
}

@Injectable()
export class LeaderboardService {
  private readonly logger = new Logger(LeaderboardService.name);

  constructor(
    @InjectRepository(Credential) private readonly credentialRepository: Repository<Credential>,
    @InjectRepository(ActivityLogEntity) private readonly activityLogRepository: Repository<ActivityLogEntity>,
  ) {}

  async getLeaderboard(period: LeaderboardPeriod): Promise<LeaderboardEntryResponse[]> {
    try {
      const rows = await this.credentialRepository
        .createQueryBuilder('c')
        .leftJoin('c.userBadges', 'ub')
        .select([
          'c.credentialId AS "userId"',
          'c.displayName AS "displayName"',
          'c.activeBadge AS "codename"',
          'c.level AS "level"',
          'c.xp AS "totalXp"',
          'COUNT(ub.badgeId) AS "badges"',
        ])
        .groupBy('c.credentialId, c.displayName, c.activeBadge, c.level, c.xp')
        .getRawMany<BaseRow>();

      const monthlyXpByUser = period === 'month' ? await this.computeMonthlyXp() : null;

      // totalXp est conservé pour le départage (podium toujours rempli en vue mensuelle),
      // puis retiré de la réponse finale.
      const entries = rows.map((row) => {
        const totalXp = Number(row.totalXp);
        return {
          userId: row.userId,
          displayName: row.displayName,
          codename: row.codename,
          badges: Number(row.badges),
          level: Number(row.level),
          xp: monthlyXpByUser ? (monthlyXpByUser.get(row.userId) ?? 0) : totalXp,
          totalXp,
        };
      });

      entries.sort((a, b) => b.xp - a.xp || b.totalXp - a.totalXp);

      return entries.map(({ totalXp, ...entry }) => entry);
    } catch (e) {
      this.logger.error('getLeaderboard failed', e);
      throw new LeaderboardGetException();
    }
  }

  /**
   * Reconstitue l'XP gagné depuis le 1er du mois en cours à partir des logs ADD
   * (magasins, produits, prix, cercles hebdo), pondérés par XP_WEIGHT_BY_ENTITY_TYPE.
   */
  private async computeMonthlyXp(): Promise<Map<string, number>> {
    const monthStart = this.startOfCurrentMonth();

    const rows = await this.activityLogRepository
      .createQueryBuilder('a')
      .select('a.credentialId', 'credentialId')
      .addSelect('a.entityType', 'entityType')
      .addSelect('COUNT(*)', 'count')
      .where('a.actionType = :add', { add: ActionType.ADD })
      .andWhere('a.created >= :monthStart', { monthStart })
      .groupBy('a.credentialId')
      .addGroupBy('a.entityType')
      .getRawMany<{ credentialId: string; entityType: string; count: string }>();

    const result = new Map<string, number>();
    for (const row of rows) {
      const weight = XP_WEIGHT_BY_ENTITY_TYPE[row.entityType] ?? 0;
      const gained = Number(row.count) * weight;
      result.set(row.credentialId, (result.get(row.credentialId) ?? 0) + gained);
    }
    return result;
  }

  /** Retourne le 1er jour du mois en cours à 00:00:00 UTC. */
  private startOfCurrentMonth(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  }
}
