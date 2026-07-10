import {Component, computed, DestroyRef, inject, input, OnInit, signal, ChangeDetectionStrategy} from '@angular/core';
import {Header} from "@core/layout/header/header";
import { RouterLink} from '@angular/router';
import {ProductDto} from '@features/catalog/data/dto/product.dto';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CurrencyPipe, Location} from '@angular/common';
import {MatButton, MatIconButton} from '@angular/material/button';
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
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {
  AddProductToListDialog
} from '@features/catalog/component/dialog/add-product-to-list-dialog/add-product-to-list-dialog';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {AppNode} from '@shared/route/node.enum';
import {AppRoutes} from '@shared/route/app-routes.enum';
import {formatQuantity, referencePriceUnitLabel} from '@features/catalog/data/dto/product.dto';
import {DialogService} from '@shared/component/confirm-dialog/dialog.service';
import {CatalogNav} from '@features/catalog/component/catalog-nav/catalog-nav';
import {ReportButton} from '@shared/component/report-button/report-button';
import {ReportTargetType} from '@features/report/data/dto/report.dto';
import {ReportDialogDetail} from '@shared/component/data/report-dialog.type';
import {StoreDto} from '@features/catalog/data/dto/store.dto';

@Component({
  selector: 'app-store-products',
  imports: [
    Header,
    RouterLink,
    CurrencyPipe,
    MatButton,
    Footer,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatSuffix,
    MatPaginator,
    MatMenu,
    MatMenuTrigger,
    MatIconButton,
    MatMenuItem,
    CatalogNav,
    ReportButton,
  ],
  templateUrl: './store-products.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './store-products.css'
})
export class StoreProducts implements OnInit {



  private destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private productService = inject(ProductService);
  private storeService = inject(StoreService);
  private dialogService = inject(DialogService);
  protected readonly AppNode = AppNode;
  protected readonly referencePriceUnitLabel = referencePriceUnitLabel;
  protected readonly formatQuantity = formatQuantity;
  protected readonly ReportTargetType = ReportTargetType;

  // dynamic url
  storeId = input.required<string>();

  store = this.storeService.selectedStore;
  storeProducts = this.productService.storeProducts


  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  searchTerm = signal('');
  readonly AppRoutes = AppRoutes;

  pageIndex = signal(0);
  pageSize = signal(10);


  constructor(public location: Location) {
  }

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

  pagedProducts = computed(() => {
    const items = this.filteredProducts() ?? [];
    const start = this.pageIndex() * this.pageSize();
    return items.slice(start, start + this.pageSize());
  })


  // getProductDetailUrl(productId: string): string {
  //   return AppRoutes.PRODUCT_DETAIL_PAGE.replace(':productId', productId);
  // }

  onSearchChange(searchValue: string) {
    this.searchTerm.set(searchValue);
    this.pageIndex.set(0);
  }

  onPage(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
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

  onOpenDialogAddPrice(product: ProductDto,) {
    const dialogRef = this.dialog.open(AddPriceDialog, {
      data: {product: product}
    });
  }

  onOpenDialogAddToList(product: ProductDto,) {
    const dialogRef = this.dialog.open(AddProductToListDialog, {
      data: {product: product}
    });
  }

  onOpenDialogAddProduct() {
    const dialogRef = this.dialog.open(AddProductDialog, {
      data: {store: this.store()}
    });
  }

  onOpenDialogDeleteProduct(product: ProductDto) {
    this.dialogService.confirmDialog({
      title: 'Êtes vous sûr ?',
      message: 'En confirmant cette action, vous supprimerez le produit, ainsi que les prix de celui-ci',
      confirmCaption: 'Supprimer',
      cancelCaption: 'Annuler'
    }).subscribe((result) => {
      if (result) {
        console.log('Suppression du produit')
        this.productService.deleteProduct(+product.productId, +this.storeId()).subscribe()
      }
    })
  }

  onClearSearch() {
    this.searchTerm.set('')
    this.pageIndex.set(0);
  }

  storeReportDetails(store: StoreDto): ReportDialogDetail[] {
    const details: ReportDialogDetail[] = [
      {label: 'Magasin', value: store.name},
    ];
    if (store.brand?.name) {
      details.push({label: 'Enseigne', value: store.brand.name});
    }
    details.push(
      {label: 'Adresse', value: `${store.street} ${store.number}`},
      {label: 'Code postal', value: store.postalCode},
      {label: 'Ville', value: store.city},
    );
    return details;
  }


}
