import {CanActivate, ExecutionContext, Inject, Injectable, Logger} from "@nestjs/common";
import {Reflector} from "@nestjs/core";
import {isNil} from "lodash";
import * as admin from "firebase-admin";
import {IS_PUBLIC_KEY} from "@common/config/decorator/public.decorator";
import {NoTokenFoundedException, TokenExpiredException} from "../security.exception";
import {SecurityService} from "../security.service";
import {FIREBASE_ADMIN} from "./firebase-admin.provider";

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    private readonly logger = new Logger(FirebaseAuthGuard.name);

    constructor(@Inject(FIREBASE_ADMIN) private readonly firebaseApp: admin.app.App,
                private readonly securityService: SecurityService,
                private reflector: Reflector) { // permet de recuperer les metadonées
    }

    canActivate(context: ExecutionContext): boolean | Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY,[context.getHandler(), context.getClass()]);
        return isPublic ? true : this.validateToken(context.switchToHttp().getRequest());
    }

    private async validateToken(request: any): Promise<boolean> {
        // le champ 'authorization' / token existe il dans le header
        if (isNil(request.headers['authorization'])) {
            throw new NoTokenFoundedException();
        }
        try {
            const idToken = request.headers['authorization'].replace('Bearer ', '');
            // verifie le ID token Firebase et recupere les claims (uid, email, name, ...)
            const decoded = await this.firebaseApp.auth().verifyIdToken(idToken);
            // si valide, on retrouve (ou on cree) le Credential applicatif lie a cet uid
            request.user = await this.securityService.findOrCreate(decoded);
            return true;
        } catch (e) {
            this.logger.log(e.message);
            throw new TokenExpiredException();
        }
    }
}
