import {TokenService} from "./jwt/token.service";
import {SecurityController} from "./security.controller";
import {SecurityService} from "./security.service";
import {Token} from "./model/entity/token.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {ConfigKey} from "@common/config/enum/config-key.enum";
import {configManager} from "@common/config/config.manager";
import {JwtModule} from "@nestjs/jwt";
import {Module} from "@nestjs/common";
import {Credential} from "./model/entity/credential.entity";

@Module({
    imports: [JwtModule.register({
        global: true,
        secret: configManager.getValue(ConfigKey.JWT_TOKEN_SECRET),
        signOptions: {expiresIn: configManager.getValue(ConfigKey.JWT_TOKEN_EXPIRE_IN)},
    }), TypeOrmModule.forFeature([Credential, Token])],

    exports: [SecurityService],
    providers: [SecurityService, TokenService],
    controllers: [SecurityController]
})
export class SecurityModule {
}