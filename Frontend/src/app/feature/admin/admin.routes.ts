import {Routes} from '@angular/router';
import {AppNode} from '@shared/route/node.enum';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: AppNode.ADMIN_USERS,
    pathMatch: 'full'
  },
  {
    path: AppNode.ADMIN_USERS,
    loadComponent: () => import('./page/admin-dashboard-page/admin-dashboard-page').then(c => c.AdminDashboardPage)
  },
  {
    path: AppNode.ADMIN_ACTIVITY,
    loadComponent: () => import('./page/activity-page/activity-page').then(c => c.ActivityPage)
  },
  {
    path: AppNode.ADMIN_REPORTS,
    loadComponent: () => import('./page/reports-page/reports-page').then(c => c.ReportsPage)
  },
  {
    path: `report/${AppNode.ADMIN_REPORT}`, // 'report/:reportId'
    loadComponent: () => import('./page/report-detail-page/report-detail-page').then(c => c.ReportDetailPage)
  },
];
