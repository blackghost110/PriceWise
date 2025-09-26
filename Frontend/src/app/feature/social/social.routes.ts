import {Routes} from '@angular/router';
import {AppNode} from '@shared/route/node.enum';

export const socialRoutes: Routes = [
  {
    path: '',
    redirectTo: AppNode.DASHBOARD,
    pathMatch: 'full'
  },
  {
    path: AppNode.DASHBOARD,
    loadComponent: () => import('./page/forum/forum').then(c => c.Forum)
  },
  {
    path: `post/${AppNode.POST}`, // 'post/:postId'
    loadComponent: () => import('./page/post-comments/post-comments').then(c => c.PostComments)
  },
  {
    path: AppNode.FALL_BACK,
    loadComponent: () => import('./page/social-fallback-page/social-fallback-page').then(c => c.SocialFallbackPage)
  }
];
