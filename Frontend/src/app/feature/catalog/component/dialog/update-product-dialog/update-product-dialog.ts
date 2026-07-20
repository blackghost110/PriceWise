import {Component, DestroyRef, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatButton} from '@angular/material/button';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {catchError, EMPTY} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';
import {ProductService} from '@features/catalog/service/product.service';
import {UpdateProductPayload} from '@features/catalog/data/payload/update-product.payload';
import {ProductDetailDto} from '@features/catalog/data/dto/product-detail.dto';
import {ProductUnitType} from '@features/catalog/data/dto/product.dto';
import {ErrorMessageService} from '@shared/api/service/error-message.service';

@Component({
  selector: 'app-update-product-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatButton,
    ReactiveFormsModule,
  ],
  templateUrl: './update-product-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './update-product-dialog.css'
})
export class UpdateProductDialog {

  destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<UpdateProductDialog>);

  private productService = inject(ProductService);
  private errorMessageService = inject(ErrorMessageService);

  data = inject(MAT_DIALOG_DATA);

  // injected dialog data
  product: ProductDetailDto = this.data.product;

  errorMessage = signal<string | null>(null);

  productForm = new FormGroup({
    name: new FormControl<string>('', {
      validators: [Validators.required]
    }),
    brand: new FormControl<string>(''),
    unit: new FormControl<ProductUnitType | null>(null, {
      validators: [Validators.required]
    }),
    quantity: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)]
    }),
    ean: new FormControl<string>(''),
  })

  ngOnInit() {
    this.productForm.patchValue({
      name: this.product.name,
      brand: this.product.brand,
      unit: this.product.unit as ProductUnitType,
      quantity: this.product.quantity,
      ean: this.product.ean ?? '',
    });
  }

  onUpdateProduct() {
    if (this.productForm.invalid) {
      return;
    }
    this.errorMessage.set(null);

    const formValue = this.productForm.value;
    const ean = formValue.ean?.trim();
    const payload: UpdateProductPayload = {
      name: formValue.name!,
      brand: formValue.brand ?? '',
      unit: formValue.unit!,
      quantity: formValue.quantity!,
      ean: ean ? ean : undefined,
    };

    this.productService.updateProduct(payload, this.product.productId).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => {
        this.errorMessage.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data))
        return EMPTY;
      })
    ).subscribe(() => this.dialogRef.close(true));
  }

  onClose() {
    this.dialogRef.close();
  }
}
