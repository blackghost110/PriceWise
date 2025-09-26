import {Routes} from '@angular/router';
import {AppNode} from '@shared/route/node.enum';

export const authRoutes: Routes = [
  {
    path: '',
    redirectTo: AppNode.SIGN_IN,
    pathMatch: 'full'
  },
  {
    path: AppNode.SIGN_IN,
    loadComponent: () => import('./page/sign-in-page/sign-in-page').then(c => c.SignInPage)
  },
  {
    path: AppNode.SIGN_UP,
    loadComponent: () => import('./page/sign-up-page/sign-up-page').then(c => c.SignUpPage)
  },
  {
    path: AppNode.FALL_BACK,
    loadComponent: () => import('./page/security-fallback-page/security-fallback-page').then(c => c.SecurityFallbackPage)
  }
];



