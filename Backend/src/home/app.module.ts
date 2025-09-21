import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import {TypeOrmModule} from "@nestjs/typeorm";
import {configManager} from "@common/config/config.manager";
import {APP_GUARD} from "@nestjs/core";
import {JwtGuard} from "../security/jwt/jwt.guard";
import {SecurityModule} from "../security/security.module";
import {CatalogModule} from "../module/catalog/catalog.module";
import { SocialModule } from '../module/social/social.module';

@Module({
  imports: [TypeOrmModule.forRoot(configManager.getTypeOrmConfig()), SecurityModule, CatalogModule, SocialModule],
  controllers: [AppController],
  providers: [AppService, {provide: APP_GUARD, useClass: JwtGuard}],
})
export class AppModule {}
