import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from '../../security/model/entity/credential.entity';
import { StoreEntity } from '../catalog/model/store.entity';
import { ProductEntity } from '../catalog/model/product.entity';
import { PriceEntity } from '../catalog/model/price.entity';
import { PostEntity } from '../social/model/post.entity';
import { CommentEntity } from '../social/model/comment.entity';
import { ActivityLogModule } from '../activity-log/activity-log.module';
import { ActivityLogEntity } from '../activity-log/model/activity-log.entity';
import { BadgeEntity } from './model/badge.entity';
import { UserBadgeEntity } from './model/user-badge.entity';
import { BadgeController } from './controller/badge.controller';
import { BadgeService } from './service/badge.service';
import { BadgeSeederService } from './service/badge-seeder.service';
import { XpService } from './service/xp.service';
import { LeaderboardController } from './controller/leaderboard.controller';
import { LeaderboardService } from './service/leaderboard.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BadgeEntity,
      UserBadgeEntity,
      Credential,
      StoreEntity,
      ProductEntity,
      PriceEntity,
      PostEntity,
      CommentEntity,
      ActivityLogEntity,
    ]),
    ActivityLogModule,
  ],
  controllers: [BadgeController, LeaderboardController],
  providers: [BadgeService, BadgeSeederService, XpService, LeaderboardService],
  exports: [XpService],
})
export class GamificationModule {}
