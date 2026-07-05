import {Component, DestroyRef, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatFormField, MatHint, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {PriceService} from '@features/catalog/service/price.service';
import {CreatePricePayload} from '@features/catalog/data/payload/create-price.payload';
import {computeReferencePrice, ProductDto, referencePriceUnitLabel} from '@features/catalog/data/dto/product.dto';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {catchError, debounceTime, distinctUntilChanged, EMPTY} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {UpdatePricePayload} from '@features/catalog/data/payload/update-price.payload';

@Component({
  selector: 'app-add-price-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatDialogActions,
    FormsModule,
    MatButton,
    ReactiveFormsModule,
    MatSuffix,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatHint,
  ],
  templateUrl: './add-price-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './add-price-dialog.css'
})
export class AddPriceDialog {

  destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<AddPriceDialog>);

  private readonly priceService = inject(PriceService)
  private errorMessageService = inject(ErrorMessageService)

  data = inject(MAT_DIALOG_DATA);

  // injected data
  product: ProductDto = this.data.product;
  updatePriceId = signal(0);


  isSameDate = signal(false)
  errorMessage = signal<string | null>(null);

  suggestionHint = signal<string | null>(null);
  private referenceManuallyEdited = signal(false);



  priceForm = new FormGroup({
    productPrice: new FormControl('', {
      validators: [Validators.required, Validators.min(0.01)]
    }),
    referencePrice: new FormControl('', {
      validators: [Validators.required, Validators.min(0.01)]
    }),
    priceDate: new FormControl( new Date(),{
      validators: [Validators.required]
      }
    )
  })

  constructor() {
    this.setupReferenceSuggestion();
  }

  private setupReferenceSuggestion() {
    const referenceControl = this.priceForm.get('referencePrice');
    const priceControl = this.priceForm.get('productPrice');

    referenceControl?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.referenceManuallyEdited.set(!!value);
    });

    priceControl?.valueChanges.pipe(
      debounceTime(400),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(productPrice => {
      const suggested = computeReferencePrice(Number(productPrice), this.product.quantity, this.product.unit);

      if (suggested === null) {
        this.suggestionHint.set(null);
        return;
      }

      const unitLabel = referencePriceUnitLabel(this.product.unit);
      this.suggestionHint.set(`Suggéré d'après ${this.product.quantity}${this.product.unit} → ${suggested.toFixed(2)} €/${unitLabel}`);

      if (!this.referenceManuallyEdited()) {
        referenceControl?.setValue(suggested.toFixed(2), { emitEvent: false });
      }
    });
  }


  onAddPrice() {
    if (this.priceForm.invalid) {
      return
    }
    this.errorMessage.set(null);



      const formValue = this.priceForm.value;
      const payload: CreatePricePayload = {
        productPrice: Number(formValue.productPrice),
        referencePrice: Number(formValue.referencePrice),
        priceDate: this.formatDateToLocal(formValue.priceDate!)
      };

      this.priceService.addPrice(payload, this.product.productId).pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err: HttpErrorResponse) => {
          this.errorMessage.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data))
          this.isSameDate.set(true);
          this.updatePriceId.set(err.error?.data?.priceId ?? 0)
          this.priceForm?.disable();
          return EMPTY;
        })
      ).subscribe(() => this.dialogRef.close(true));
  }

  onUpdatePrice() {
    if (this.priceForm.invalid) {
      return;
    }

    this.errorMessage.set(null);

    const formValue = this.priceForm.value;

    const payload: UpdatePricePayload = {
      productPrice: Number(formValue.productPrice),
      referencePrice: Number(formValue.referencePrice)
    };

    const priceId = this.updatePriceId();

    this.priceService.updatePrice(payload, priceId).pipe(
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

  dateFutureFilter = (date: Date | null): boolean => {
    if (!date) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const inputDate = new Date(date);
    inputDate.setHours(0, 0, 0, 0);

    return inputDate <= today;
  }

  private formatDateToLocal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }


  onChangeDate() {
    this.isSameDate.set(false);
    this.errorMessage.set(null);
    this.priceForm?.enable();
  }


}
