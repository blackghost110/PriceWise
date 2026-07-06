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
import {MatCheckbox} from "@angular/material/checkbox";
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
    ReactiveFormsModule,
    MatCheckbox],
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

    // Pré-remplir les couleurs depuis la marque partagée (si elle existe déjà)
    const brand = this.store.brand;
    if (brand) {
      this.storeForm.patchValue({
        textColor: brand.textColor,
        bgColor: brand.bgColor,
        useGradient: !!brand.gradientColor,
        gradientColor: brand.gradientColor ?? this.storeForm.controls.gradientColor.value,
      });
    }
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

    // Apparence du badge du magasin (modifier ici met à jour la marque partagée :
    // tous les magasins du même nom suivront cette couleur)
    textColor: new FormControl<string>('#ffffff', { nonNullable: true }),
    bgColor: new FormControl<string>('#43a047', { nonNullable: true }),
    useGradient: new FormControl<boolean>(false, { nonNullable: true }),
    gradientColor: new FormControl<string>('#e30613', { nonNullable: true }),
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
      textColor: formValue.textColor,
      bgColor: formValue.bgColor,
      gradientColor: formValue.useGradient ? formValue.gradientColor : null,

    }

    this.storeService.updateStore(payload, +this.store.storeId).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => {
        this.errorMessage.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data))
        return EMPTY;
      })
    ).subscribe(() => this.dialogRef.close())


  }

  badgePreviewBg(): string {
    const { bgColor, useGradient, gradientColor } = this.storeForm.getRawValue();
    if (useGradient && gradientColor) {
      return `linear-gradient(100deg, ${bgColor} 0%, ${bgColor} 55%, ${gradientColor} 100%)`;
    }
    return bgColor;
  }

  badgePreviewColor(): string {
    return this.storeForm.getRawValue().textColor;
  }

  badgePreviewName(): string {
    return this.storeForm.getRawValue().name?.trim() || 'Aperçu';
  }



  onClose() {
    this.dialogRef.close();
  }
}
