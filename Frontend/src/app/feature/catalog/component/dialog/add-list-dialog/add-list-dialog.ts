import {Component, DestroyRef, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatFormField} from "@angular/material/form-field";
import {MatInput, MatLabel} from "@angular/material/input";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CreateListPayload} from '@features/catalog/data/payload/create-list.payload';
import {ListService} from '@features/catalog/service/list.service';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {catchError, EMPTY} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-add-list-dialog',
    imports: [
        MatButton,
        MatDialogActions,
        MatDialogContent,
        MatDialogTitle,
        MatFormField,
        MatInput,
        MatLabel,
        ReactiveFormsModule
    ],
  templateUrl: './add-list-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './add-list-dialog.css'
})
export class AddListDialog {

  destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<AddListDialog>);

  listService = inject(ListService)
  private errorMessageService = inject(ErrorMessageService)

  errorMessage = signal<string | null>(null);



  listForm = new FormGroup({
    name: new FormControl<string>('', {
      validators: [Validators.required]
    }),
  })




  onAddList() {
    console.log(this.listForm)
    if (this.listForm.invalid) {
      console.log('invalid form')
      return
    }
    const formValue = this.listForm.value;
    const payload: CreateListPayload = {
      name: formValue.name!,
    }
    console.log('price payload :', payload)

    this.listService.addList(payload).pipe(
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
