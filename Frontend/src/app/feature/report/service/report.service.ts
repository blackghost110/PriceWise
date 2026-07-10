import {inject, Injectable, signal} from '@angular/core';
import {ApiService} from '@shared/api/service/api.service';
import {ApiURI} from '@shared/api/api-uri.enum';
import {tap} from 'rxjs';
import {SnackbarService} from '@shared/service/snackbar.service';
import {CreateReportPayload} from '@features/report/data/payload/create-report.payload';
import {ReportDto, ReportStatus} from '@features/report/data/dto/report.dto';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private readonly api = inject(ApiService)
  private snackbar = inject(SnackbarService)

  private _reportList = signal<ReportDto[] | null>(null)
  reportList = this._reportList.asReadonly()

  private _selectedReport = signal<ReportDto | null>(null)
  selectedReport = this._selectedReport.asReadonly()

  createReport(payload: CreateReportPayload) {
    return this.api.post(`${ApiURI.REPORT_CREATE}`, payload).pipe(
      tap(() => this.snackbar.show('Signalement envoyé, merci !'))
    );
  }

  getReports(status?: ReportStatus) {
    const url = status ? `${ApiURI.REPORT_GET_ALL}?status=${status}` : `${ApiURI.REPORT_GET_ALL}`;
    return this.api.get<ReportDto[]>(url)
      .pipe(
        tap((reports) => this._reportList.set(reports))
      )
  }

  getReport(reportId: number) {
    return this.api.get<ReportDto>(`${ApiURI.REPORT_GET}/${reportId}`)
      .pipe(
        tap((report) => this._selectedReport.set(report))
      )
  }

  updateReportStatus(reportId: number, status: ReportStatus) {
    return this.api.put<ReportDto>(`${ApiURI.REPORT_UPDATE_STATUS}/${reportId}/status`, {status}).pipe(
      tap((report) => {
        this._selectedReport.set(report)
        this.snackbar.show('Statut du signalement mis à jour')
      })
    );
  }

}
