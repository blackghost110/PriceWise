import {inject} from '@angular/core';
import {CanActivateFn, Router, UrlTree} from '@angular/router';
import {AuthService} from '@core/auth/auth.service';
import {AppNode} from '@shared/route/node.enum';


export const authGuard: CanActivateFn = async (route, state): Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = await authService.checkUser();

  if (isAuth) {
    return true;
  }

  return router.createUrlTree([AppNode.AUTH]);
};

export const publicGuard: CanActivateFn = async (): Promise<boolean | UrlTree> => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isAuth = await authService.checkUser();

  if (isAuth) {
    return router.createUrlTree([AppNode.CATALOG]);
  }

  return true;
};

