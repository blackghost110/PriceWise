import {Component, computed, DestroyRef, inject, input, OnInit, signal} from '@angular/core';
import {Header} from "@core/layout/header/header";
import { RouterLink} from '@angular/router';
import {ProductDto} from '@features/catalog/data/dto/product.dto';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {MatButton} from '@angular/material/button';
import {AddPriceDialog} from '@features/catalog/component/dialog/add-price-dialog/add-price-dialog';
import {MatDialog} from '@angular/material/dialog';
import {ProductService} from '@features/catalog/service/product.service';
import {StoreService} from '@features/catalog/service/store.service';
import {finalize, forkJoin} from 'rxjs';
import {AddProductDialog} from '@features/catalog/component/dialog/add-product-dialog/add-product-dialog';
import {Footer} from '@core/layout/footer/footer';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-store-products',
  imports: [
    Header,
    RouterLink,
    DatePipe,
    CurrencyPipe,
    MatButton,
    Footer,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatSuffix,
  ],
  templateUrl: './store-products.html',
  styleUrl: './store-products.css'
})
export class StoreProducts implements OnInit {


  private destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private productService = inject(ProductService);
  private storeService = inject(StoreService);


  // dynamic url
  storeId = input.required<string>();

  store = this.storeService.selectedStore;
  storeProducts = this.productService.storeProducts


  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  searchTerm = signal('');


  ngOnInit() {
    this.isLoading.set(true);

    forkJoin({
      products: this.productService.getProducts(Number(this.storeId())),
      store: this.storeService.getStore(Number(this.storeId()))
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading.set(false))
    ).subscribe();

  }

  filteredProducts = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const products = this.storeProducts();

    if (!search || !products) {
      return products;
    }

    const searchTerms = search.split(' ').filter(term => term.length > 0);

    return products.filter(product => {
      const searchableText = [
        product.name,
        product.brand || '',
        product.quantity.toString(),
        product.unit
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });

  })

  onSearchChange(searchValue: string) {
    this.searchTerm.set(searchValue);
  }



  onOpenDialogAddPrice(product: ProductDto,) {
    const dialogRef = this.dialog.open(AddPriceDialog, {
      data: {product: product}
    });
  }

  onOpenDialogAddProduct() {
    const dialogRef = this.dialog.open(AddProductDialog, {
      data: {store: this.store()}
    });
  }

  onClearSearch() {
    this.searchTerm.set('')
  }
}
