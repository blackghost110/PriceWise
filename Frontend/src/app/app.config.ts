import {
  ApplicationConfig,
  LOCALE_ID,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection
} from '@angular/core';
import {provideRouter, withComponentInputBinding} from '@angular/router';

import { routes } from './app.routes';
import {provideHttpClient, withInterceptors, withXhr} from '@angular/common/http';
import {HttpInterceptor} from '@shared/api/service/http.interceptor';
import {registerLocaleData} from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import {provideNativeDateAdapter} from '@angular/material/core';
import {provideCharts, withDefaultRegisterables} from 'ng2-charts';
import {initializeApp, provideFirebaseApp} from '@angular/fire/app';
import {getAuth, provideAuth} from '@angular/fire/auth';
import {environment} from '../environment/environment.dev';

registerLocaleData(localeFr, 'fr-FR');

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR'},
    provideNativeDateAdapter(),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withXhr(), withInterceptors([HttpInterceptor])),
    provideCharts(withDefaultRegisterables()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth())
  ]
};
