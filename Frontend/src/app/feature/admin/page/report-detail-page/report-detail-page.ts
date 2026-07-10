import {ChangeDetectionStrategy, Component, computed, inject, input, OnInit} from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import {AdminNav} from '@features/admin/component/admin-nav/admin-nav';
import {RouterLink} from '@angular/router';
import {DatePipe} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {AppRoutes} from '@shared/route/app-routes.enum';
import {RelativeTimePipe} from '@shared/pipe/relative-time.pipe';
import {avatarGradient, initials} from '@shared/util/avatar.util';
import {ReportService} from '@features/report/service/report.service';
import {reportTargetTypeLabel, ReportStatus, ReportTargetType} from '@features/report/data/dto/report.dto';

@Component({
  selector: 'app-report-detail-page',
  imports: [
    Header,
    Footer,
    AdminNav,
    RouterLink,
    DatePipe,
    MatButton,
    MatIcon,
    RelativeTimePipe,
  ],
  templateUrl: './report-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './report-detail-page.css'
})
export class ReportDetailPage implements OnInit {

  private readonly reportService = inject(ReportService);

  readonly AppRoutes = AppRoutes;
  protected readonly initials = initials;
  protected readonly avatarGradient = avatarGradient;
  protected readonly reportTargetTypeLabel = reportTargetTypeLabel;
  protected readonly ReportStatus = ReportStatus;
  protected readonly ReportTargetType = ReportTargetType;

  // dynamic url
  reportId = input.required<string>();

  report = this.reportService.selectedReport;

  /** Lien vers la page du contenu visé, quand une route existe pour ce type de cible. */
  targetLink = computed(() => {
    const report = this.report();
    if (!report) return null;
    switch (report.targetType) {
      case ReportTargetType.STORE:
        return AppRoutes.storeProductsPage(report.targetId);
      case ReportTargetType.PRODUCT:
        return AppRoutes.productDetailPage(report.targetId);
      case ReportTargetType.POST:
        return AppRoutes.postPage(report.targetId);
      default:
        return null; // pas de page dédiée pour un commentaire seul
    }
  });

  ngOnInit() {
    this.reportService.getReport(+this.reportId()).subscribe();
  }

  onResolve() {
    this.reportService.updateReportStatus(+this.reportId(), ReportStatus.RESOLVED).subscribe();
  }

  onReopen() {
    this.reportService.updateReportStatus(+this.reportId(), ReportStatus.PENDING).subscribe();
  }
}
