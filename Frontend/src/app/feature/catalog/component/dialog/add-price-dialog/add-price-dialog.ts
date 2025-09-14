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

  private readonly priceService = inject(PriceService)

  destroyRef = inject(DestroyRef);

  dialogRef = inject(MatDialogRef<AddPriceDialog>);
  data = inject(MAT_DIALOG_DATA);


  // injected data
  product: ProductDto = this.data.product;


  isSameDate = signal(false)




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

    if (!this.isSameDay(this.priceForm.value.priceDate!, this.product.priceDate)) {

      const formValue = this.priceForm.value;
      console.log('price date avant payload : ', formValue.priceDate);
      const payload: CreatePricePayload = {
        productPrice: Number(formValue.productPrice),
        grossPrice: Number(formValue.grossPrice),
        priceDate: this.formatDateToLocal(formValue.priceDate!)
      };
      console.log('price payload :', payload)

      this.priceService.addPrice(payload, this.product.productId).pipe(
        takeUntilDestroyed(this.destroyRef)
      ).subscribe({
        next: (response) => {
          console.log('addPrice response :', response)
        },
      })
      this.dialogRef.close();
    } else {
      this.isSameDate.set(true);
      this.priceForm.get('priceDate')?.disable();
      console.log('bingooo meme date, voulez vous mettre un autre prix ?')
    }

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
    this.priceForm.get('priceDate')?.enable();
  }


}
