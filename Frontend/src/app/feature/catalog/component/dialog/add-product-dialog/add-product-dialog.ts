import {Component, DestroyRef, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {StoreDto} from '@features/catalog/data/dto/store.dto';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {MatHint, MatInput, MatLabel} from '@angular/material/input';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {CreateProductPayload} from '@features/catalog/data/payload/create-product.payload';
import {computeReferencePrice, ProductDto, ProductUnitType, referencePriceUnitLabel} from '@features/catalog/data/dto/product.dto';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ProductService} from '@features/catalog/service/product.service';
import {debounceTime, distinctUntilChanged, map, merge, startWith, catchError, EMPTY} from 'rxjs';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {HttpErrorResponse} from '@angular/common/http';


@Component({
  selector: 'app-add-product-dialog',
  imports: [
    FormsModule,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatInput,
    MatLabel,
    MatSuffix,
    ReactiveFormsModule,
    MatSelect,
    MatOption,
    MatHint,
    MatAutocompleteTrigger,
    MatAutocomplete
  ],
  templateUrl: './add-product-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './add-product-dialog.css'
})
export class AddProductDialog {

  destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<AddProductDialog>);
  data = inject(MAT_DIALOG_DATA);


  productService = inject(ProductService)
  private errorMessageService = inject(ErrorMessageService)


  // injected data
  store: StoreDto = this.data.store;

  filteredProducts = signal<ProductDto[]>([]);
  allProducts = signal<ProductDto[]>([]);


  errorMessage = signal<string | null>(null);

  suggestionHint = signal<string | null>(null);
  private referenceManuallyEdited = signal(false);

  constructor() {
    this.productService.getProducts(Number(this.store.storeId))
      .subscribe(products => {
        this.allProducts.set(products)
        this.filteredProducts.set([])
      })

    this.setupNameAutocomplete();
    this.setupReferenceSuggestion();
  }

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
    productPrice: new FormControl<number| null>(null, {
      validators: [Validators.required, Validators.min(0.01)]
    }),
    referencePrice: new FormControl<number| null>(null, {
      validators: [Validators.required, Validators.min(0.01)]
    }),
  })



  onAddProduct() {
    console.log(this.productForm)
    if (this.productForm.invalid) {
      console.log('invalid form')
      return
    }
    this.errorMessage.set(null);

    const formValue = this.productForm.value;
    const payload: CreateProductPayload = {
      name: formValue.name!,
      brand: formValue.brand ?? '',
      unit: formValue.unit!,
      quantity: formValue.quantity!,
      initialPrice: formValue.productPrice!,
      initialReferencePrice: formValue.referencePrice!
    }
    console.log('price payload :', payload)

    this.productService.addProduct(payload, Number(this.store.storeId)).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => {
        this.errorMessage.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data))
        return EMPTY;
      })
    ).subscribe(() => this.dialogRef.close())



  }

  private setupNameAutocomplete() {
    const nameControl = this.productForm.get('name');

    if (nameControl) {
      nameControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300),
        distinctUntilChanged(),
        map(value => this.filterProducts(value || '')),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(filtered => {
        this.filteredProducts.set(filtered);
        this.errorMessage.set(null);
      });
    }
  }

  private setupReferenceSuggestion() {
    const productPriceControl = this.productForm.get('productPrice');
    const quantityControl = this.productForm.get('quantity');
    const unitControl = this.productForm.get('unit');
    const referenceControl = this.productForm.get('referencePrice');

    referenceControl?.valueChanges.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(value => {
      this.referenceManuallyEdited.set(!!value);
    });

    if (!productPriceControl || !quantityControl || !unitControl || !referenceControl) {
      return;
    }

    merge(
      productPriceControl.valueChanges,
      quantityControl.valueChanges,
      unitControl.valueChanges
    ).pipe(
      debounceTime(400),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(() => {
      const { productPrice, quantity, unit } = this.productForm.getRawValue();
      const suggested = computeReferencePrice(productPrice, quantity, unit);

      if (suggested === null) {
        this.suggestionHint.set(null);
        return;
      }

      const unitLabel = referencePriceUnitLabel(unit!);
      this.suggestionHint.set(`Suggéré d'après ${quantity}${unit} → ${suggested.toFixed(2)} €/${unitLabel}`);

      if (!this.referenceManuallyEdited()) {
        referenceControl.setValue(suggested, { emitEvent: false });
      }
    });
  }

  private filterProducts(searchTerm: string): ProductDto[] {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const filterValue = searchTerm.toLowerCase();

    return this.allProducts().filter(product =>
      product.name.toLowerCase().includes(filterValue) ||
      product.brand?.toLowerCase().includes(filterValue)
    ).slice(0, 5);
  }

  onProductSelected(selectedProduct: ProductDto) {
    this.productForm.patchValue({
      name: selectedProduct.name,
      brand: selectedProduct.brand || '',
      unit: selectedProduct.unit,
      quantity: selectedProduct.quantity
    });

    this.filteredProducts.set([]);
  }

  onClose() {
    this.dialogRef.close();
  }

}
