import {ListService} from "./service/list.service";
import {ProductService} from "./service/product.service";
import {StoreService} from "./service/store.service";
import {PriceController} from "./controller/price.controller";
import { PriceService } from "./service/price.service";
import {StoreController} from "./controller/store.controller";
import {ListEntity} from "./model/list.entity";
import {ProductEntity} from "./model/product.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {StoreEntity} from "./model/store.entity";
import {PriceEntity} from "./model/price.entity";
import {Module} from "@nestjs/common";
import {ListProductEntity} from "./model/list-product.entity";
import {ListController} from "./controller/list.controller";
import {ProductController} from "./controller/product.controller";
import {Credential} from "../../security/model/entity/credential.entity";
import {SecurityController} from "../../security/security.controller";
import {SecurityService} from "../../security/security.service";
import { ListProductController } from './controller/list-product.controller';
import { ListProductService } from './service/list-product.service';
import { GamificationModule } from '../gamification/gamification.module';
import { ActivityLogModule } from '../activity-log/activity-log.module';

@Module({
    imports: [
      TypeOrmModule.forFeature([ListEntity, Credential, ProductEntity, StoreEntity, PriceEntity, ListProductEntity]),
      GamificationModule,
      ActivityLogModule,
    ],
    controllers: [ListController, ProductController, StoreController, PriceController, SecurityController, ListProductController],
    providers: [ListService, ProductService, StoreService, PriceService, SecurityService, ListProductService],
})
export class CatalogModule {
}
