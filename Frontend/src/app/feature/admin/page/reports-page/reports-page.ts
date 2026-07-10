import {ChangeDetectionStrategy, Component, inject, OnInit, signal} from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import {AdminNav} from '@features/admin/component/admin-nav/admin-nav';
import {RouterLink} from '@angular/router';
import {DatePipe} from '@angular/common';
import {AppRoutes} from '@shared/route/app-routes.enum';
import {RelativeTimePipe} from '@shared/pipe/relative-time.pipe';
import {avatarGradient, initials} from '@shared/util/avatar.util';
import {ReportService} from '@features/report/service/report.service';
import {reportTargetTypeLabel, ReportStatus} from '@features/report/data/dto/report.dto';

type StatusFilter = ReportStatus | 'ALL';

@Component({
  selector: 'app-reports-page',
  imports: [
    Header,
    Footer,
    AdminNav,
    RouterLink,
    DatePipe,
    RelativeTimePipe,
  ],
  templateUrl: './reports-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './reports-page.css'
})
export class ReportsPage implements OnInit {

  private readonly reportService = inject(ReportService);

  readonly AppRoutes = AppRoutes;
  protected readonly initials = initials;
  protected readonly avatarGradient = avatarGradient;
  protected readonly reportTargetTypeLabel = reportTargetTypeLabel;
  protected readonly ReportStatus = ReportStatus;

  reportList = this.reportService.reportList;

  statusFilter = signal<StatusFilter>(ReportStatus.PENDING);

  ngOnInit() {
    this.loadReports();
  }

  onFilterChange(status: StatusFilter) {
    this.statusFilter.set(status);
    this.loadReports();
  }

  private loadReports() {
    const status = this.statusFilter();
    this.reportService.getReports(status === 'ALL' ? undefined : status).subscribe();
  }
}
