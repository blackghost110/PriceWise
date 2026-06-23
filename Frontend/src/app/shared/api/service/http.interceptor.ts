import {environment} from '../../../../environment/environment.dev';
import {HttpHandlerFn, HttpInterceptorFn, HttpRequest} from '@angular/common/http';
import {inject} from '@angular/core';
import {Auth} from '@angular/fire/auth';
import {Router} from '@angular/router';
import {EMPTY, from, Observable, switchMap} from 'rxjs';
import {AppRoutes} from '@shared/route/app-routes.enum';

const baseURL: string = environment.apiURL;

// Main function of httpInterceptor
export const HttpInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  // requests outside our own API are forwarded untouched
  if (!req.url.startsWith(baseURL)) {
    return next(req);
  }

  const auth = inject(Auth);
  const router: Router = inject(Router);
  const firebaseUser = auth.currentUser;

  // No active Firebase session: every backend route now requires auth, nothing to call
  if (!firebaseUser) {
    return redirectToPublic(router);
  }

  // getIdToken() returns the cached token, transparently refreshing it if it expired
  return from(firebaseUser.getIdToken()).pipe(
    switchMap((idToken: string) => next(setTokenInHeader(req, idToken)))
  );
}

// function for navigate to public part ... this is called when there is no Firebase session
const redirectToPublic: (router: Router) => Observable<any> = (router: Router) => {
  router.navigate([AppRoutes.SIGN_IN_PAGE]).then();
  return EMPTY;
}

// function for set the Firebase ID token in header
const setTokenInHeader = (req: HttpRequest<any>, token: string): HttpRequest<any> => {
  return req.clone({
    headers: req.headers.set('Authorization', `Bearer ${token}`)
  });
}
