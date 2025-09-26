import {Component, computed, DestroyRef, effect, inject, OnInit, signal, viewChild} from '@angular/core';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {Footer} from '@core/layout/footer/footer';
import {Header} from '@core/layout/header/header';
import {MatButton} from '@angular/material/button';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {ProductService} from '@features/catalog/service/product.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable, MatTableDataSource
} from '@angular/material/table';
import {ProductsAllDto} from '@features/catalog/data/dto/products-all.dto';
import {MatPaginator} from '@angular/material/paginator';
import {AppNode} from '@shared/route/node.enum';
import {AppRoutes} from '@shared/route/app-routes.enum';


@Component({
  selector: 'app-product-list',
  imports: [
    Footer,
    Header,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatSuffix,
    RouterLink,
    RouterLinkActive,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    MatHeaderCellDef,
    CurrencyPipe,
    DatePipe,
    MatPaginator,
    MatButton

  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {

  productService = inject(ProductService);
  destroyRef = inject(DestroyRef);
  paginator = viewChild(MatPaginator);

  dataSource = new MatTableDataSource<ProductsAllDto>([]);
  displayedColumns: string[] = ['name','quantity', 'price','place', 'lastPrice' ];



  products = this.productService.allProducts

  searchTerm = signal('');
  storeNameFilter = signal('');
  storePostalCodeFilter = signal('');
  readonly AppRoutes = AppRoutes;


  constructor() {
    // Effect pour mettre à jour le dataSource quand les données changent
    effect(() => {
      const product = this.filteredProducts();
      if (product) {
        this.dataSource.data = product;
      }
    });

    // Effect pour connecter le paginator quand il est disponible
    effect(() => {
      const pag = this.paginator();
      if (pag) {
        this.dataSource.paginator = pag;
      }
    });
  }

  ngOnInit() {
    // this.productService.getAllProducts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe()
    this.loadProducts();
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


  // ------
  private loadProducts() {
    const filters: { storeName?: string; storePostalCode?: string } = {};

    if (this.storeNameFilter()) {
      filters.storeName = this.storeNameFilter();
    }
    if (this.storePostalCodeFilter()) {
      filters.storePostalCode = this.storePostalCodeFilter();
    }

    this.productService.getAllProducts(Object.keys(filters).length > 0 ? filters : undefined)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }


  // getProductDetailUrl(productId: string): string {
  //   return AppRoutes.PRODUCT_DETAIL_PAGE.replace(':productId', productId);
  // }

  onStoreNameChange(value: string) {
    this.storeNameFilter.set(value);
  }

  onClearStoreName() {
    this.storeNameFilter.set('');
  }

  onStorePostalCodeChange(value: string) {
    this.storePostalCodeFilter.set(value);
  }

  onClearStorePostalCode() {
    this.storePostalCodeFilter.set('');
  }

  applyFilters() {
    this.loadProducts();
  }

  clearAllFilters() {
    this.storeNameFilter.set('');
    this.storePostalCodeFilter.set('');
    this.searchTerm.set('');
    this.loadProducts();
  }

  protected readonly AppNode = AppNode;
}
