import { Routes } from '@angular/router';
import {AppNode} from '@shared/route/node.enum';
import {GlobalFallBackPage} from '@shared/route/global-fall-back-page/global-fall-back-page';
import {authGuard, publicGuard} from '@core/auth/auth.guard';


export const routes: Routes = [
  {
    path: '',
    redirectTo: `/${AppNode.AUTH}`,
    pathMatch: 'full'
  },
  {
    path: AppNode.AUTH,
    loadChildren: () => import('./core/auth/auth.routes').then(r => r.authRoutes),
    canActivate: [publicGuard]
  },
  {
    path: AppNode.HOME,
    loadComponent: () => import('./core/layout/home/home').then(c => c.Home),
    canActivate: [authGuard]
  },
  {
    path: AppNode.CATALOG,
    loadChildren: () => import('./feature/catalog/catalog.routes').then(r => r.catalogRoutes),
    canActivate: [authGuard]
  },
  {
    path: AppNode.FORUM,
    loadChildren: () => import('./feature/social/social.routes').then(r => r.socialRoutes),
    canActivate: [authGuard]
  },
  {
    path: AppNode.FALL_BACK,
    component: GlobalFallBackPage
  }
];
