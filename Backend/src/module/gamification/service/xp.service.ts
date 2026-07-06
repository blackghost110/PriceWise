import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Credential } from '../../../security/model/entity/credential.entity';
import { PriceEntity } from '../../catalog/model/price.entity';
import {
  levelForXp,
  WEEKLY_CIRCLE_GOAL,
  XP_REWARDS,
  XP_THRESHOLDS,
} from '../data/xp.constants';
import { ProfileGamificationResponse } from '../model/type/profile-gamification.response';
import { ActivityLogService } from '../../activity-log/service/activity-log.service';

@Injectable()
export class XpService {
  private readonly logger = new Logger(XpService.name);

  constructor(
    @InjectRepository(Credential)
    private readonly credentialRepository: Repository<Credential>,
    @InjectRepository(PriceEntity)
    private readonly priceRepository: Repository<PriceEntity>,
    private readonly activityLogService: ActivityLogService,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Points d'entrée appelés depuis les services catalog (best-effort)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Attribue +10 XP pour la création d'un magasin.
   * Appelé depuis StoreService — n'échoue jamais la création.
   */
  async awardStoreXp(credentialId: string): Promise<void> {
    try {
      await this.credentialRepository.increment({ credentialId }, 'xp', XP_REWARDS.ADD_STORE);
      await this.syncLevel(credentialId);
    } catch (e) {
      this.logger.error('awardStoreXp failed', e);
    }
  }

  /**
   * Attribue +3 XP (produit) + +1 XP (prix initial).
   * Vérifie aussi le cercle hebdomadaire pour le prix initial.
   * Appelé depuis ProductService — n'échoue jamais la création.
   */
  async awardProductXp(credentialId: string): Promise<void> {
    try {
      await this.credentialRepository.increment({ credentialId }, 'xp', XP_REWARDS.ADD_PRODUCT + XP_REWARDS.ADD_PRICE);
      await this.checkAndAwardWeeklyCircle(credentialId);
      await this.syncLevel(credentialId);
    } catch (e) {
      this.logger.error('awardProductXp failed', e);
    }
  }

  /**
   * Attribue +1 XP pour l'ajout d'un prix et vérifie le cercle hebdomadaire.
   * Appelé depuis PriceService — n'échoue jamais la création.
   */
  async awardPriceXp(credentialId: string): Promise<void> {
    try {
      await this.credentialRepository.increment({ credentialId }, 'xp', XP_REWARDS.ADD_PRICE);
      await this.checkAndAwardWeeklyCircle(credentialId);
      await this.syncLevel(credentialId);
    } catch (e) {
      this.logger.error('awardPriceXp failed', e);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Données pour l'endpoint GET /badge/profile
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Retourne la progression XP et les statistiques hebdomadaires de l'utilisateur.
   */
  async getProfileGamification(credential: Credential): Promise<ProfileGamificationResponse> {
    const level = credential.level;
    const xp = credential.xp;

    const levelIndex = level - 1;
    const currentLevelXp = XP_THRESHOLDS[levelIndex] ?? 0;
    const nextLevelXp =
      levelIndex < XP_THRESHOLDS.length - 1 ? XP_THRESHOLDS[levelIndex + 1] : null;

    const xpIntoLevel = xp - currentLevelXp;
    const xpForNextLevel = nextLevelXp !== null ? nextLevelXp - currentLevelXp : 0;

    const weeklyStats = await this.getWeeklyStats(credential);

    return {
      level,
      xp,
      xpIntoLevel,
      xpForNextLevel,
      weeklyCount: weeklyStats.count,
      weeklyMax: WEEKLY_CIRCLE_GOAL,
      weekDays: weeklyStats.weekDays,
      weeklyCircleCompleted: weeklyStats.completed,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Helpers privés
  // ─────────────────────────────────────────────────────────────────────────

  /** Met à jour le niveau stocké après un increment() atomique de l'XP. */
  private async syncLevel(credentialId: string): Promise<void> {
    const credential = await this.credentialRepository.findOneBy({ credentialId });
    if (!credential) return;
    const newLevel = levelForXp(credential.xp);
    if (credential.level !== newLevel) {
      await this.credentialRepository.update({ credentialId }, { level: newLevel });
    }
  }

  /**
   * Attribue le bonus de cercle hebdomadaire (+20 XP) si le seuil est atteint
   * et qu'il n'a pas encore été accordé cette semaine.
   * Utilise increment() pour l'XP afin d'éviter les écrasements concurrents.
   */
  private async checkAndAwardWeeklyCircle(credentialId: string): Promise<void> {
    const currentWeekKey = this.weekKey(new Date());
    const credential = await this.credentialRepository.findOneBy({ credentialId });
    // Sortie anticipée : évite la requête COUNT si le cercle est déjà complété cette semaine
    if (!credential || credential.lastWeeklyCircleWeek === currentWeekKey) return;

    const weekStart = this.startOfIsoWeek(new Date());
    const count = await this.priceRepository.count({
      where: {
        user: { credentialId },
        created: MoreThanOrEqual(weekStart),
      },
    });

    if (count < WEEKLY_CIRCLE_GOAL) return;

    await this.credentialRepository.increment({ credentialId }, 'xp', XP_REWARDS.WEEKLY_CIRCLE);
    await this.credentialRepository.increment({ credentialId }, 'weeklyCircle', 1);
    await this.credentialRepository.update({ credentialId }, { lastWeeklyCircleWeek: currentWeekKey });
    this.activityLogService.logWeeklyCircle(credentialId, currentWeekKey).catch(() => {});
  }

  /**
   * Compte les contributions de prix de la semaine et construit le tableau weekDays.
   */
  private async getWeeklyStats(
    credential: Credential,
  ): Promise<{ count: number; weekDays: boolean[]; completed: boolean }> {
    const weekStart = this.startOfIsoWeek(new Date());

    const prices = await this.priceRepository.find({
      where: {
        user: { credentialId: credential.credentialId },
        created: MoreThanOrEqual(weekStart),
      },
    });

    const weekDays: boolean[] = [false, false, false, false, false, false, false];
    for (const price of prices) {
      // getDay() : 0=Dim, 1=Lun … → (getDay()+6)%7 : 0=Lun … 6=Dim
      const dayIndex = (price.created.getDay() + 6) % 7;
      weekDays[dayIndex] = true;
    }

    const completed = credential.lastWeeklyCircleWeek === this.weekKey(new Date());

    return {
      count: Math.min(prices.length, WEEKLY_CIRCLE_GOAL),
      weekDays,
      completed,
    };
  }

  /** Retourne le lundi à 00:00:00 UTC de la semaine contenant date. */
  private startOfIsoWeek(date: Date): Date {
    const d = new Date(date);
    const day = d.getUTCDay(); // 0=Dim, 1=Lun …
    const diff = day === 0 ? -6 : 1 - day; // distance au lundi précédent
    d.setUTCDate(d.getUTCDate() + diff);
    d.setUTCHours(0, 0, 0, 0);
    return d;
  }

  /** Retourne une clé unique par semaine ISO au format "YYYY-MM-DD" (date du lundi). */
  private weekKey(date: Date): string {
    return this.startOfIsoWeek(date).toISOString().split('T')[0];
  }
}
