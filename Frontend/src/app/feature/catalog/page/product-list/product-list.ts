import {Component, computed, DestroyRef, inject, OnInit, signal, ChangeDetectionStrategy} from '@angular/core';
import {CurrencyPipe} from '@angular/common';
import {Footer} from '@core/layout/footer/footer';
import {Header} from '@core/layout/header/header';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
import {RouterLink} from '@angular/router';
import {ProductService} from '@features/catalog/service/product.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ProductsAllDto} from '@features/catalog/data/dto/products-all.dto';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {AppNode} from '@shared/route/node.enum';
import {AppRoutes} from '@shared/route/app-routes.enum';
import {formatQuantity, referencePriceUnitLabel} from '@features/catalog/data/dto/product.dto';
import {CatalogNav} from '@features/catalog/component/catalog-nav/catalog-nav';


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
    CurrencyPipe,
    MatPaginator,
    CatalogNav,

  ],
  templateUrl: './product-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product-list.css'
})
export class ProductList implements OnInit {

  private static readonly FILTER_DEBOUNCE_MS = 400;

  productService = inject(ProductService);
  destroyRef = inject(DestroyRef);

  products = this.productService.allProducts

  searchTerm = signal('');
  storeNameFilter = signal('');
  storePostalCodeFilter = signal('');
  readonly AppRoutes = AppRoutes;

  pageIndex = signal(0);
  pageSize = signal(10);

  private filterDebounceTimer?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    // this.productService.getAllProducts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe()
    this.loadProducts();
    this.destroyRef.onDestroy(() => clearTimeout(this.filterDebounceTimer));
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

  pagedProducts = computed(() => {
    const items = this.filteredProducts() ?? [];
    const start = this.pageIndex() * this.pageSize();
    return items.slice(start, start + this.pageSize());
  })

  onPage(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSearchChange(searchValue: string) {
    this.searchTerm.set(searchValue);
    this.pageIndex.set(0);
  }

  onClearSearch() {
    this.searchTerm.set('')
    this.pageIndex.set(0);
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
    this.debounceApplyFilters();
  }

  onClearStoreName() {
    this.storeNameFilter.set('');
    this.applyFiltersNow();
  }

  onStorePostalCodeChange(value: string) {
    this.storePostalCodeFilter.set(value);
    this.debounceApplyFilters();
  }

  onClearStorePostalCode() {
    this.storePostalCodeFilter.set('');
    this.applyFiltersNow();
  }

  private debounceApplyFilters() {
    clearTimeout(this.filterDebounceTimer);
    this.filterDebounceTimer = setTimeout(() => this.applyFiltersNow(), ProductList.FILTER_DEBOUNCE_MS);
  }

  private applyFiltersNow() {
    clearTimeout(this.filterDebounceTimer);
    this.pageIndex.set(0);
    this.loadProducts();
  }

  relativeDate(date: Date | string): string {
    const target = new Date(date);
    const diffDays = Math.floor((Date.now() - target.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) {
      return "Aujourd'hui";
    }
    if (diffDays === 1) {
      return 'Hier';
    }
    if (diffDays < 7) {
      return `Il y a ${diffDays}j`;
    }
    if (diffDays < 30) {
      return `Il y a ${Math.round(diffDays / 7)} sem.`;
    }
    if (diffDays < 365) {
      return `Il y a ${Math.round(diffDays / 30)} mois`;
    }
    const years = Math.round(diffDays / 365);
    return `Il y a ${years} an${years > 1 ? 's' : ''}`;
  }

  /**
   * Couleur de fond du badge : celle de la marque du magasin (dégradé si définie),
   * sinon une couleur de secours déterministe dérivée du nom (stable pour un même nom).
   */
  badgeBg(product: ProductsAllDto): string {
    const brand = product.storeBrand;
    if (brand) {
      if (brand.gradientColor) {
        return `linear-gradient(100deg, ${brand.bgColor} 0%, ${brand.bgColor} 55%, ${brand.gradientColor} 100%)`;
      }
      return brand.bgColor;
    }
    return this.fallbackColor(product.storeName);
  }

  badgeText(product: ProductsAllDto): string {
    return product.storeBrand?.textColor ?? '#ffffff';
  }

  private fallbackColor(name: string): string {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue} 55% 42%)`;
  }

  protected readonly AppNode = AppNode;
  protected readonly referencePriceUnitLabel = referencePriceUnitLabel;
  protected readonly formatQuantity = formatQuantity;
}
