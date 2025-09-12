import {inject} from '@angular/core';
import {CanActivateFn, Router, UrlTree} from '@angular/router';
import {AuthService} from '@core/auth/auth.service';


export const authGuard: CanActivateFn = async (route, state): Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = await authService.checkUser();

  if (isAuth) {
    return true;
  }

  return router.createUrlTree(['/sign-in']);
};

export const publicGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = await authService.checkUser();

  if (isAuth) {
    return router.createUrlTree(['/store-list']);
  }

  return true;
};

