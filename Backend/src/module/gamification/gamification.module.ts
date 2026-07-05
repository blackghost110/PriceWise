import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credential } from '../../security/model/entity/credential.entity';
import { StoreEntity } from '../catalog/model/store.entity';
import { ProductEntity } from '../catalog/model/product.entity';
import { PriceEntity } from '../catalog/model/price.entity';
import { PostEntity } from '../social/model/post.entity';
import { CommentEntity } from '../social/model/comment.entity';
import { BadgeEntity } from './model/badge.entity';
import { UserBadgeEntity } from './model/user-badge.entity';
import { BadgeController } from './controller/badge.controller';
import { BadgeService } from './service/badge.service';
import { BadgeSeederService } from './service/badge-seeder.service';
import { XpService } from './service/xp.service';

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
    ]),
  ],
  controllers: [BadgeController],
  providers: [BadgeService, BadgeSeederService, XpService],
  exports: [XpService],
})
export class GamificationModule {}
