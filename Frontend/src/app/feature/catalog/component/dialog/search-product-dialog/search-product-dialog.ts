import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatLabel} from '@angular/material/form-field';
import {MatFormField, MatInput} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ProductService} from '@features/catalog/service/product.service';
import {MatIcon} from '@angular/material/icon';
import { DatePipe} from '@angular/common';
import {ProductsAllDto} from '@features/catalog/data/dto/products-all.dto';

@Component({
  selector: 'app-search-product-dialog',
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
    MatButton,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatFormField,
    MatIcon,
  ],
  templateUrl: './search-product-dialog.html',
  styleUrl: './search-product-dialog.css'
})
export class SearchProductDialog implements OnInit {
  destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<SearchProductDialog>);
  data = inject(MAT_DIALOG_DATA);

  // dialog injection
  selectedProduct = this.data.selectedProduct;

  productService = inject(ProductService)

  products = this.productService.allProducts
  selectedProducts = this.productService.selectedProducts

  searchTerm = signal('');

  onLog() {
    console.log('seletedproducts :', this.selectedProducts())
  }

  ngOnInit() {
    this.productService.getAllProducts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.productService.pushSelectedProduct(this.selectedProduct);
  }

  filteredProducts = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const rawProducts = this.products();

    console.log('before', rawProducts);
    let products = rawProducts?.filter(product => !this.selectedProducts().map(product => product.productId).includes(product.productId))
    console.log('after', products);

    if (!search || !products) {
      return products;
    }

    const searchTerms = search.split(' ').filter(term => term.length > 0);

    return products.filter(product => {
      const searchableText = [
        product.name,
        product.brand || '',
        product.quantity.toString(),
        product.unit,
        product.storeName,
        product.storeCity,
        product.storeStreet,
        product.storePostalCode,
        product.storeNumber,
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });

  })

  onAddCompare() {

  }

  onAddToSelectedProducts(product: ProductsAllDto) {
    this.productService.pushSelectedProduct(product);
  }

  onRemoveFromSelectedProducts(product: ProductsAllDto) {
    this.productService.removeSelectedProduct(product);
  }

  onSearchChange(searchValue: string) {
    this.searchTerm.set(searchValue);
  }

  onClearSearch() {
    this.searchTerm.set('')
  }


  onClose() {
    this.productService.clearSelectedProducts();
    this.dialogRef.close();
  }

}
