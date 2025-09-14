import {Component, DestroyRef, Inject, inject, signal} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions, MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import { ReactiveFormsModule} from "@angular/forms";
import {ListService} from '@features/catalog/service/list.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatIcon} from '@angular/material/icon';
import {ConfirmDialogData} from '@shared/component/data/confirm-dialog.type';

@Component({
  selector: 'app-confirm-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    ReactiveFormsModule,
    MatIcon,
    MatIconButton,
    MatDialogClose
  ],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.css'
})
export class ConfirmDialog {

  constructor(@Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData) {}

}
