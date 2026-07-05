import {Component, computed, DestroyRef, effect, inject, input, OnInit, signal, viewChild, ChangeDetectionStrategy} from '@angular/core';
import {Header} from "@core/layout/header/header";
import { RouterLink} from '@angular/router';
import {ProductDto} from '@features/catalog/data/dto/product.dto';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {CurrencyPipe, DatePipe, Location} from '@angular/common';
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
import {referencePriceUnitLabel} from '@features/catalog/data/dto/product.dto';
import {DialogService} from '@shared/component/confirm-dialog/dialog.service';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './store-products.css'
})
export class StoreProducts implements OnInit {



  private destroyRef = inject(DestroyRef);
  private readonly dialog = inject(MatDialog);
  private productService = inject(ProductService);
  private storeService = inject(StoreService);
  private dialogService = inject(DialogService);
  paginator = viewChild(MatPaginator);
  protected readonly AppNode = AppNode;
  protected readonly referencePriceUnitLabel = referencePriceUnitLabel;

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


  constructor(public location: Location) {

    // Effect pour mettre à jour le dataSource quand les données changent
    effect(() => {
      const product = this.filteredProducts();
      if (product) {
        this.dataSource.data = product;
      }
    });

    // Effect pour connecter le paginator quand il est disponible
    effect(() => {
      const page = this.paginator();
      if (page) {
        this.dataSource.paginator = page;
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
  }


}
