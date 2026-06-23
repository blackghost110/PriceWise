import {SecurityController} from "./security.controller";
import {SecurityService} from "./security.service";
import {TypeOrmModule} from "@nestjs/typeorm";
import {Module} from "@nestjs/common";
import {Credential} from "./model/entity/credential.entity";
import {FirebaseAdminProvider} from "./firebase/firebase-admin.provider";

@Module({
    imports: [TypeOrmModule.forFeature([Credential])],

    exports: [SecurityService, FirebaseAdminProvider],
    providers: [SecurityService, FirebaseAdminProvider],
    controllers: [SecurityController]
})
export class SecurityModule {
}
