import { Routes } from '@angular/router';
import {AppNode} from '@shared/route/node.enum';
import {GlobalFallBackPage} from '@shared/route/global-fall-back-page/global-fall-back-page';
import {authGuard, publicGuard} from '@core/auth/auth.guard';


export const routes: Routes = [

  {
    path: '',
    redirectTo: AppNode.AUTH, pathMatch: 'full'
  },
  {
    path: AppNode.AUTH,
    loadChildren: () => import('./core/auth/auth.routes').then(r => r.authRoutes),
    canActivate: [publicGuard]
  },
  {
    path: 'home',
    loadComponent: () => import('./core/layout/home/home').then(c => c.Home),
    canActivate: [authGuard]
  },
  {
    path: 'catalog',
    loadChildren: () => import('./feature/catalog/catalog.routes').then(r => r.catalogRoutes),
    canActivate: [authGuard]
  },
  {
    path: 'forum',
    loadChildren: () => import('./feature/social/social.routes').then(r => r.socialRoutes),
    canActivate: [authGuard]
  },
  {
    path: AppNode.FALL_BACK,
    component: GlobalFallBackPage
  }





  //
  // ,{
  //   path: '',
  //   redirectTo: AppNode.SIGN_IN, pathMatch: 'full'
  // },
  // {
  //   path: AppNode.SIGN_IN,
  //   component: SignInPage,
  //   canActivate: [publicGuard]
  // },
  // {
  //   path: 'sign-up',
  //   component: SignUpPage,
  //   canActivate: [publicGuard]
  // },
  // {
  //   path: 'home',
  //   component: Home,
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'store-list',
  //   component: StoreList,
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'store-list/:storeId/products',
  //   component: StoreProducts,
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'product-list',
  //   component: ProductList,
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'personal-list',
  //   component: PersonalList,
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'product-detail/:productId',
  //   component: ProductDetail,
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'forum',
  //   component: Forum,
  //   canActivate: [authGuard]
  // },
  // {
  //   path: 'post/:postId',
  //   component: PostComments,
  //   canActivate: [authGuard]
  // },
  // {
  //   path: '**',
  //   component: GlobalFallBackPage
  // }

];
