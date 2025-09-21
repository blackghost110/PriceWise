import {Routes} from '@angular/router';
import {AppNode} from '@shared/route/node.enum';

export const catalogRoutes: Routes = [
  {
    path: '',
    redirectTo: 'store-list',
    pathMatch: 'full'
  },
  {
    path: 'store-list',
    loadComponent: () => import('./page/store-list/store-list').then(c => c.StoreList)
  },
  {
    path: 'store-list/:storeId/products',
    loadComponent: () => import('./page/store-list/store-products/store-products').then(c => c.StoreProducts)
  },
  {
    path: 'product-list',
    loadComponent: () => import('./page/product-list/product-list').then(c => c.ProductList)
  },
  {
    path: 'personal-list',
    loadComponent: () => import('./page/personal-list/personal-list').then(c => c.PersonalList)
  },
  {
    path: 'product-detail/:productId',
    loadComponent: () => import('./page/product-detail/product-detail').then(c => c.ProductDetail)
  },
  {
    path: AppNode.FALL_BACK,
    loadComponent: () => import('./page/catalog-fallback-page/catalog-fallback-page').then(c => c.CatalogFallbackPage)
  }
]
