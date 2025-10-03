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
    loadComponent: () => import('@features/social/page/forum/post-comments/post-comments').then(c => c.PostComments)
  },
  {
    path: AppNode.LEADERBOARD,
    loadComponent: () => import('./page/leaderboard/leaderboard').then(c => c.Leaderboard)
  },
  {
    path: AppNode.FALL_BACK,
    loadComponent: () => import('./page/social-fallback-page/social-fallback-page').then(c => c.SocialFallbackPage)
  }
];
