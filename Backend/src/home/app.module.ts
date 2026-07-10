import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {configManager} from "@common/config/config.manager";
import {APP_GUARD} from "@nestjs/core";
import {FirebaseAuthGuard} from "../security/firebase/firebase-auth.guard";
import {SecurityModule} from "../security/security.module";
import {CatalogModule} from "../module/catalog/catalog.module";
import { SocialModule } from '../module/social/social.module';
import { GamificationModule } from '../module/gamification/gamification.module';
import { ActivityLogModule } from '../module/activity-log/activity-log.module';
import { ReportModule } from '../module/report/report.module';

@Module({
  imports: [TypeOrmModule.forRoot(configManager.getTypeOrmConfig()), SecurityModule, CatalogModule, SocialModule, GamificationModule, ActivityLogModule, ReportModule],
  controllers: [AppController],
  providers: [AppService, {provide: APP_GUARD, useClass: FirebaseAuthGuard}],
})
export class AppModule {}
