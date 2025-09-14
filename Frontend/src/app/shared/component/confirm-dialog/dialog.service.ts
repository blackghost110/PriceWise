import { Injectable } from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {ConfirmDialogData} from '@shared/component/data/confirm-dialog.type';
import {ConfirmDialog} from '@shared/component/confirm-dialog/confirm-dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  constructor(private dialog: MatDialog) {}

  confirmDialog(data: ConfirmDialogData): Observable<boolean> {
    return this.dialog
      .open(ConfirmDialog, {
        data,
        width: '500px',
        disableClose: true,
      })
      .afterClosed();
  }
}
