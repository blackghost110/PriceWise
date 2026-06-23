import {Provider} from "@nestjs/common";
import * as admin from "firebase-admin";
import {configManager} from "@common/config/config.manager";

export const FIREBASE_ADMIN = 'FIREBASE_ADMIN';

// initialise le SDK firebase-admin une seule fois et l'expose comme provider injectable
export const FirebaseAdminProvider: Provider = {
    provide: FIREBASE_ADMIN,
    useFactory: (): admin.app.App => {
        const {projectId, clientEmail, privateKey} = configManager.getFirebaseConfig();
        return admin.apps.length
            ? admin.app()
            : admin.initializeApp({
                credential: admin.credential.cert({projectId, clientEmail, privateKey}),
            });
    },
};
