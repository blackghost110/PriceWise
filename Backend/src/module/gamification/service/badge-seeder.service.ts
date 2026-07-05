import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadgeEntity } from '../model/badge.entity';
import { BADGE_DEFINITIONS } from '../data/badge-definitions';

// Insère le catalogue des 36 badges au démarrage de l'application si absent (idempotent,
// clé categoryName + tier grâce à la contrainte @Unique sur BadgeEntity).
@Injectable()
export class BadgeSeederService implements OnModuleInit {
  private readonly logger = new Logger(BadgeSeederService.name);

  constructor(
    @InjectRepository(BadgeEntity) private readonly badgeRepository: Repository<BadgeEntity>,
  ) {}

  async onModuleInit() {
    const existing = await this.badgeRepository.find();
    const existingKeys = new Set(existing.map((b) => `${b.categoryName}_${b.tier}`));

    const missing = BADGE_DEFINITIONS.filter(
      (def) => !existingKeys.has(`${def.categoryName}_${def.tier}`),
    );

    if (missing.length === 0) {
      return;
    }

    await this.badgeRepository.save(missing.map((def) => this.badgeRepository.create(def)));
    this.logger.log(`${missing.length} badge(s) seedé(s) en base.`);
  }
}
