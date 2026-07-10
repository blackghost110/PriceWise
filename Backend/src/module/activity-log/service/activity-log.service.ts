import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActionType, ActivityLogEntity, EntityType } from '../model/activity-log.entity';
import { ActivityLogGetAllException } from '../activity-log.exception';

@Injectable()
export class ActivityLogService {
  private readonly logger = new Logger(ActivityLogService.name);

  constructor(
    @InjectRepository(ActivityLogEntity)
    private readonly activityLogRepository: Repository<ActivityLogEntity>,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Lecture (endpoint admin)
  // ─────────────────────────────────────────────────────────────────────────

  /** Retourne l'ensemble des logs d'activité, du plus récent au plus ancien. */
  async findAll(): Promise<ActivityLogEntity[]> {
    try {
      return await this.activityLogRepository.find({ relations: { credential: true }, order: { created: 'DESC' } });
    } catch (e) {
      throw new ActivityLogGetAllException();
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Points d'entrée appelés depuis les services catalog (best-effort)
  // ─────────────────────────────────────────────────────────────────────────

  /** Journalise la création d'une entité. Appelé en fire-and-forget (.catch(() => {})). */
  logAdd(entityType: EntityType, entityId: number, credentialId: string): Promise<void> {
    return this.write(ActionType.ADD, entityType, entityId, credentialId, { id: entityId });
  }

  /** Journalise la suppression d'une entité. Appelé en fire-and-forget (.catch(() => {})). */
  logDelete(entityType: EntityType, entityId: number, credentialId: string): Promise<void> {
    return this.write(ActionType.DELETE, entityType, entityId, credentialId, { id: entityId });
  }

  /**
   * Journalise la complétion d'un cercle hebdomadaire (+20 XP). Pas d'entité propre
   * (entityId = 0), utilisé pour reconstituer l'XP mensuel du classement.
   * Appelé en fire-and-forget (.catch(() => {})).
   */
  logWeeklyCircle(credentialId: string, weekKey: string): Promise<void> {
    return this.write(ActionType.ADD, EntityType.WEEKLY_CIRCLE, 0, credentialId, { weekKey });
  }

  /** Journalise la modification d'une entité, avec son état avant/après. Appelé en fire-and-forget. */
  logUpdate(
    entityType: EntityType,
    entityId: number,
    credentialId: string,
    before: Record<string, unknown>,
    after: Record<string, unknown>,
  ): Promise<void> {
    return this.write(ActionType.UPDATE, entityType, entityId, credentialId, {
      id: entityId,
      before,
      after,
    });
  }

  private async write(
    actionType: ActionType,
    entityType: EntityType,
    entityId: number,
    credentialId: string,
    detail: Record<string, unknown>,
  ): Promise<void> {
    try {
      const log = this.activityLogRepository.create({
        actionType,
        entityType,
        entityId,
        credentialId,
        detail,
      });
      await this.activityLogRepository.save(log);
    } catch (e) {
      // Best-effort : un échec de journalisation ne doit jamais faire échouer l'action métier.
      this.logger.error('activity log write failed', e);
    }
  }
}
