import {Component, DestroyRef, inject, signal} from '@angular/core';
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
import {MatOption, MatSelect, MatSelectModule} from '@angular/material/select';
import {CreateProductPayload} from '@features/catalog/data/payload/create-product.payload';
import {ProductDto, ProductUnitType} from '@features/catalog/data/dto/product.dto';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ProductService} from '@features/catalog/service/product.service';
import {debounceTime, distinctUntilChanged, map, startWith} from 'rxjs';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';


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
  styleUrl: './add-product-dialog.css'
})
export class AddProductDialog {

  destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<AddProductDialog>);
  data = inject(MAT_DIALOG_DATA);

  productService = inject(ProductService)


  // injected data
  store: StoreDto = this.data.store;

  filteredProducts = signal<ProductDto[]>([]);
  allProducts = signal<ProductDto[]>([]);

  isProductConflict = signal(false)


  constructor() {
    this.productService.getProducts(Number(this.store.storeId))
      .subscribe(products => {
        this.allProducts.set(products.data)
        this.filteredProducts.set([])
      })

    this.setupNameAutocomplete();
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
    grossPrice: new FormControl<number| null>(null, {
      validators: [Validators.required, Validators.min(0.01)]
    }),
  })



  onAddProduct() {
    console.log(this.productForm)
    if (this.productForm.invalid) {
      console.log('invalid form')
      return
    }

    const formValue = this.productForm.value;
    const payload: CreateProductPayload = {
      name: formValue.name!,
      brand: formValue.brand ?? '',
      unit: formValue.unit!,
      quantity: formValue.quantity!,
      initialPrice: formValue.productPrice!,
      initialGrossPrice: formValue.grossPrice!
    }
    console.log('price payload :', payload)

    this.productService.addProduct(payload, Number(this.store.storeId)).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(response => {
      if (!response.result) {
        this.isProductConflict.set(true);
      } else {
        this.dialogRef.close();
      }
    })



  }

  private setupNameAutocomplete() {
    const nameControl = this.productForm.get('name');

    if (nameControl) {
      // Utiliser les reactive forms avec RxJS
      nameControl.valueChanges.pipe(
        startWith(''),
        debounceTime(300), // Attendre 300ms après la dernière frappe
        distinctUntilChanged(),
        map(value => this.filterProducts(value || '')),
        takeUntilDestroyed(this.destroyRef)
      ).subscribe(filtered => {
        this.filteredProducts.set(filtered);
        this.isProductConflict.set(false);
      });
    }
  }

  private filterProducts(searchTerm: string): ProductDto[] {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    const filterValue = searchTerm.toLowerCase();

    return this.allProducts().filter(product =>
      product.name.toLowerCase().includes(filterValue) ||
      product.brand?.toLowerCase().includes(filterValue)
    ).slice(0, 5); // Limiter à 5 suggestions
  }

  onProductSelected(selectedProduct: ProductDto) {
    // Pré-remplir le formulaire avec les données du produit sélectionné
    this.productForm.patchValue({
      name: selectedProduct.name,
      brand: selectedProduct.brand || '',
      unit: selectedProduct.unit,
      quantity: selectedProduct.quantity
    });

    // Vider les suggestions
    this.filteredProducts.set([]);
  }

  // displayProduct(product: ProductDto): string {
  //   return product ? `${product.name} - ${product.brand}` : '';
  // }

  onClose() {
    this.dialogRef.close();
  }

}
