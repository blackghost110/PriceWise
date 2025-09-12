import { Routes } from '@angular/router';
import {AppNode} from './shared/route/node.enum';
import {SignInPage} from './core/auth/page/sign-in-page/sign-in-page';
import {GlobalFallBackPage} from '@shared/route/global-fall-back-page/global-fall-back-page';
import {StoreList} from '@features/catalog/page/store-list/store-list';
import {authGuard, publicGuard} from '@core/auth/auth.guard';
import {StoreProducts} from '@features/catalog/page/store-list/store-products/store-products';
import {ProductList} from '@features/catalog/page/product-list/product-list';

export const routes: Routes = [

  {
    path: '',
    redirectTo: AppNode.SIGN_IN, pathMatch: 'full'
  },
  {
    path: AppNode.SIGN_IN,
    component: SignInPage,
    canActivate: [publicGuard]
  },
  {
    path: 'store-list',
    component: StoreList,
    canActivate: [authGuard]
  },
  {
    path: 'store-list/:storeId/products',
    component: StoreProducts,
    canActivate: [authGuard]
  },
  {
    path: 'product-list',
    component: ProductList,
    canActivate: [authGuard]
  },
  {
    path: '**',
    component: GlobalFallBackPage
  }




  // {
  //   path: '',
  //   redirectTo: AppNode.PUBLIC, pathMatch: 'full'
  // },
  //
  // {
  //   path: AppNode.PUBLIC,
  //   loadChildren: () => import('@security').then(r => r.securityRoutes)
  // },
  //
  // {
  //   path: AppNode.AUTHENTICATED,
  //   //canActivate: [DashboardGuard()],
  //   loadChildren: () => import('@dashboard').then(r => r.dashboardRoutes)
  // },
  //
  // {
  //   path: AppNode.FALL_BACK,
  //   loadComponent: () => import('../shared/routes/global-fall-back-page/global-fall-back-page.component').then(r => r.GlobalFallBackPageComponent)
  // },


];
