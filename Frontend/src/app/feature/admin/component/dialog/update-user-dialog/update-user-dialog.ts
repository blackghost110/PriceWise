import {Component, DestroyRef, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatFormField} from "@angular/material/form-field";
import { MatLabel} from "@angular/material/input";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {catchError, EMPTY} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {UpdateListDialog} from '@features/catalog/component/dialog/update-list-dialog/update-list-dialog';
import {UserDto} from '@core/auth/data/dto/user.dto';
import {UpdateUserPayload} from '@features/admin/data/payload/update-user.payload';
import {AdminService} from '@features/admin/admin.service';
import {MatOption, MatSelect} from '@angular/material/select';

@Component({
  selector: 'app-update-user-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatLabel,
    ReactiveFormsModule,
    MatOption,
    MatSelect,
    MatOption
  ],
  templateUrl: './update-user-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './update-user-dialog.css'
})
export class UpdateUserDialog {

  destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<UpdateListDialog>);

  adminService = inject(AdminService)
  private errorMessageService = inject(ErrorMessageService)

  data = inject(MAT_DIALOG_DATA);

  // injected dialog data
  user: UserDto = this.data.user;

  errorMessage = signal<string | null>(null);


  userForm = new FormGroup({
    role: new FormControl<string>(this.user.role, {
      nonNullable: true,
      validators: [Validators.required]
    }),
  })




  onUpdateList() {
    console.log(this.userForm)
    if (this.userForm.invalid) {
      console.log('invalid form')
      return
    }
    this.errorMessage.set(null);

    const formValue = this.userForm.value;
    const payload: UpdateUserPayload = {
      role: formValue.role!,
    }

    this.adminService.updateUser(payload, this.user.credentialId).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => {
        this.errorMessage.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data))
        return EMPTY;
      })
    ).subscribe(() => this.dialogRef.close())


  }

  onClose() {
    this.dialogRef.close();
  }


}
