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
import {MatInput, MatLabel} from "@angular/material/input";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {catchError, EMPTY} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {StoreService} from '@features/catalog/service/store.service';
import {UpdateStorePayload} from '@features/catalog/data/payload/update-store.payload';
import {StoreDto} from '@features/catalog/data/dto/store.dto';

@Component({
  selector: 'app-update-store-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule],
  templateUrl: './update-store-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './update-store-dialog.css'
})
export class UpdateStoreDialog {
  destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<UpdateStoreDialog>);

  private storeService = inject(StoreService);
  private errorMessageService = inject(ErrorMessageService)

  data = inject(MAT_DIALOG_DATA);

  // injected dialog data
  store: StoreDto = this.data.store;

  errorMessage = signal<string | null>(null);


  ngOnInit() {
    // Pré-remplir le formulaire avec les données du magasin
    this.storeForm.patchValue({
      name: this.data.store.name,
      street: this.data.store.street,
      number: this.data.store.number,
      postalCode: this.data.store.postalCode,
      city: this.data.store.city
    });
  }


  storeForm = new FormGroup({
    name: new FormControl<string>('', {
      validators: [Validators.required]
    }),
    street: new FormControl<string>('', {
      validators: [Validators.required]
    }),
    number: new FormControl<string>('', {
      validators: [Validators.required]
    }),
    postalCode: new FormControl<string>('', {
      validators: [Validators.required]
    }),
    city: new FormControl<string>('', {
      validators: [Validators.required]
    }),
  })



  onUpdateStore() {
    console.log(this.storeForm)
    if (this.storeForm.invalid) {
      console.log('invalid form')
      return
    }
    this.errorMessage.set(null);

    const formValue = this.storeForm.value;
    const payload: UpdateStorePayload = {
      name: formValue.name!,
      street: formValue.street!,
      number: formValue.number!,
      postalCode: formValue.postalCode!,
      city: formValue.city!,

    }

    this.storeService.updateStore(payload, +this.store.storeId).pipe(
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
