import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {Footer} from '@core/layout/footer/footer';
import {Header} from '@core/layout/header/header';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
import {RouterLink} from '@angular/router';
import {ProductService} from '@features/catalog/service/product.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-product-list',
  imports: [
    CurrencyPipe,
    DatePipe,
    Footer,
    Header,
    MatButton,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatSuffix,
    RouterLink

  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {

  productService = inject(ProductService);
  destroyRef = inject(DestroyRef);


  products = this.productService.allProducts

  searchTerm = signal('');


  ngOnInit() {
    this.productService.getAllProducts().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe()
  }

  filteredProducts = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const products = this.products();

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


  onSearchChange(searchValue: string) {
    this.searchTerm.set(searchValue);
  }

  onClearSearch() {
    this.searchTerm.set('')
  }

}
