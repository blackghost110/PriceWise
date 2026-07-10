import {ChangeDetectionStrategy, Component, DestroyRef, inject, signal} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {catchError, EMPTY} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ReportService} from '@features/report/service/report.service';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {ReportDialogData} from '@shared/component/data/report-dialog.type';
import {CreateReportPayload} from '@features/report/data/payload/create-report.payload';

@Component({
  selector: 'app-report-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatIconButton,
    MatIcon,
    MatDialogClose,
    ReactiveFormsModule,
  ],
  templateUrl: './report-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './report-dialog.css'
})
export class ReportDialog {

  destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<ReportDialog>);

  private readonly reportService = inject(ReportService);
  private errorMessageService = inject(ErrorMessageService);

  data: ReportDialogData = inject(MAT_DIALOG_DATA);

  errorMessage = signal<string | null>(null);

  reportForm = new FormGroup({
    description: new FormControl('', {
      validators: [Validators.required, Validators.maxLength(1000)]
    })
  });

  onSubmit() {
    if (this.reportForm.invalid) {
      return;
    }
    this.errorMessage.set(null);

    const payload: CreateReportPayload = {
      targetType: this.data.targetType,
      targetId: this.data.targetId,
      description: this.reportForm.value.description!,
    };

    this.reportService.createReport(payload).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => {
        this.errorMessage.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data));
        return EMPTY;
      })
    ).subscribe(() => this.dialogRef.close(true));
  }

  onClose() {
    this.dialogRef.close();
  }
}
