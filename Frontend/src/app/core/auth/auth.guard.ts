import {inject} from '@angular/core';
import {CanActivateFn, Router, UrlTree} from '@angular/router';
import {AuthService} from '@core/auth/auth.service';
import {AppRoutes} from '@shared/route/app-routes.enum';


export const authGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = await authService.checkUser();

  if (isAuth) {
    return true;
  }

  return router.createUrlTree([AppRoutes.SIGN_IN_PAGE]);
};

export const publicGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = await authService.checkUser();

  if (isAuth) {
    return router.createUrlTree([AppRoutes.HOME_PAGE]);
  }

  return true;
};

export const adminGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Must resolve the Firebase auth state first, otherwise currentUser/isAdmin
  // can still be empty on a hard page reload (race with Firebase rehydration).
  await authService.checkUser();

  if (!authService.isAdmin()){
    return router.createUrlTree([AppRoutes.HOME_PAGE]);
  }

  return true;
};

