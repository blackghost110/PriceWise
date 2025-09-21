import {Component, DestroyRef, inject, signal} from '@angular/core';
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
import {ProductDto} from '@features/catalog/data/dto/product.dto';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {tap} from 'rxjs';
import {ApiResponse} from '@shared/api/data/api.response';
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



  priceForm = new FormGroup({
    productPrice: new FormControl('', {
      validators: [Validators.required, Validators.min(0.01)]
    }),
    grossPrice: new FormControl('', {
      validators: [Validators.required, Validators.min(0.01)]
    }),
    priceDate: new FormControl( new Date(),{
      validators: [Validators.required]
      }
    )
  })


  onAddPrice() {
    if (this.priceForm.invalid) {
      return
    }
    this.errorMessage.set(null);



      const formValue = this.priceForm.value;
      console.log('price date avant payload : ', formValue.priceDate);
      const payload: CreatePricePayload = {
        productPrice: Number(formValue.productPrice),
        grossPrice: Number(formValue.grossPrice),
        priceDate: this.formatDateToLocal(formValue.priceDate!)
      };

      this.priceService.addPrice(payload, this.product.productId).pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((apiResponse: ApiResponse) => {
          if (!apiResponse.result) {
            console.log('apiResponse details : ', apiResponse)
            this.errorMessage.set(this.errorMessageService.getErrorMessage(apiResponse.code, apiResponse.data))
            this.isSameDate.set(true);
            this.updatePriceId.set(apiResponse.data.priceId)
            this.priceForm.get('priceDate')?.disable();
          } else {
            this.onClose()
          }
        }),
      ).subscribe();
  }

  onUpdatePrice() {
    if (this.priceForm.invalid) {
      return;
    }

    this.errorMessage.set(null);

    const formValue = this.priceForm.value;

    const payload: UpdatePricePayload = {
      productPrice: Number(formValue.productPrice),
      grossPrice: Number(formValue.grossPrice)
    };

    const priceId = this.updatePriceId();

    this.priceService.updatePrice(payload, priceId).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((apiResponse: ApiResponse) => {
        if (!apiResponse.result) {
          console.log('apiResponse details : ', apiResponse);
          this.errorMessage.set(this.errorMessageService.getErrorMessage(apiResponse.code, apiResponse.data));
        } else {
          this.onClose();
        }
      })
    ).subscribe();
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

  private isSameDay(date1: Date, date2: Date): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
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
    this.priceForm.get('priceDate')?.enable();
  }


}
