import {Component, computed, DestroyRef, effect, inject, input, OnInit, signal, viewChild} from '@angular/core';
import {Header} from "@core/layout/header/header";
import { RouterLink} from '@angular/router';
import {ProductDto} from '@features/catalog/data/dto/product.dto';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {MatButton, MatIconButton, MatMiniFabButton} from '@angular/material/button';
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
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable, MatTableDataSource
} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {
  AddProductToListDialog
} from '@features/catalog/component/dialog/add-product-to-list-dialog/add-product-to-list-dialog';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {AppNode} from '@shared/route/node.enum';
import {AppRoutes} from '@shared/route/app-routes.enum';

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
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatPaginator,
    MatRow,
    MatRowDef,
    MatTable,
    MatHeaderCellDef,
    MatMenu,
    MatMenuTrigger,
    MatIconButton,
    MatMenuItem,
  ],
  templateUrl: './store-products.html',
  styleUrl: './store-products.css'
})
export class StoreProducts implements OnInit {


  private destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private productService = inject(ProductService);
  private storeService = inject(StoreService);
  paginator = viewChild(MatPaginator);

  dataSource = new MatTableDataSource<ProductDto>([]);
  displayedColumns: string[] = ['name','quantity', 'price', 'lastPrice', 'action' ];


  // dynamic url
  storeId = input.required<string>();

  store = this.storeService.selectedStore;
  storeProducts = this.productService.storeProducts


  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  searchTerm = signal('');
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


  // getProductDetailUrl(productId: string): string {
  //   return AppRoutes.PRODUCT_DETAIL_PAGE.replace(':productId', productId);
  // }

  onSearchChange(searchValue: string) {
    this.searchTerm.set(searchValue);
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

  onClearSearch() {
    this.searchTerm.set('')
  }

  protected readonly AppNode = AppNode;
}
