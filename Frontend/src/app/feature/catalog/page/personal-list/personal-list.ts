import {Component, computed, effect, inject, OnInit, signal, ChangeDetectionStrategy} from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import {CurrencyPipe} from '@angular/common';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
import {MatOption, MatSelect} from '@angular/material/select';
import {ReactiveFormsModule} from '@angular/forms';
import {ListService} from '@features/catalog/service/list.service';
import {ListProductService} from '@features/catalog/service/list-product.service';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {AddListDialog} from '@features/catalog/component/dialog/add-list-dialog/add-list-dialog';
import {MatDialog} from '@angular/material/dialog';
import {UpdateListDialog} from '@features/catalog/component/dialog/update-list-dialog/update-list-dialog';
import {DialogService} from '@shared/component/confirm-dialog/dialog.service';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {ListProductDto} from '@features/catalog/data/dto/list-product.dto';
import {RouterLink} from '@angular/router';
import {AppRoutes} from '@shared/route/app-routes.enum';
import {formatQuantity, referencePriceUnitLabel} from '@features/catalog/data/dto/product.dto';
import {CatalogNav} from '@features/catalog/component/catalog-nav/catalog-nav';

@Component({
  selector: 'app-personal-list',
  imports: [
    Header,
    Footer,
    MatFormField,
    MatIcon,
    MatLabel,
    MatOption,
    MatSelect,
    ReactiveFormsModule,
    CurrencyPipe,
    MatInput,
    MatSuffix,
    MatButton,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatPaginator,
    RouterLink,
    CatalogNav,
  ],
  templateUrl: './personal-list.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './personal-list.css'
})
export class PersonalList implements OnInit{

  dialog = inject(MatDialog);
  listService = inject(ListService)
  listProductService = inject(ListProductService)
  dialogService = inject(DialogService)

  personalList = this.listService.personalList
  listProducts = this.listProductService.listProducts

  selectedList = signal(0);
  searchTerm = signal('');

  pageIndex = signal(0);
  pageSize = signal(10);


  constructor() {
    effect(() => {
      this.listProductService.getListProducts(+this.selectedList()).subscribe()
    })
    effect(() => {
      const lists = this.personalList();
      if (lists && lists.length > 0) {
        this.selectedList.set(lists[0].listId)
      }
    });

    //  revenir à la première page lorsque la liste sélectionnée change
    effect(() => {
      this.selectedList();
      this.pageIndex.set(0);
    });
  }

  ngOnInit() {
    this.listService.getLists().subscribe()
  }

  filteredProducts = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const products = this.listProducts();

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

  // getProductDetailUrl(productId: string): string {
  //   return AppRoutes.PRODUCT_DETAIL_PAGE.replace(':productId', productId);
  // }

  onOpenDialogAddList() {
    const dialogRef = this.dialog.open(AddListDialog);
  }
  onOpenDialogUpdateList() {
    const dialogRef = this.dialog.open(UpdateListDialog, {
      data: { listId: this.selectedList() }
    });
  }
  onOpenDialogConfirm() {
    this.dialogService.confirmDialog({
      title: 'Êtes vous sûr ?',
      message: 'En confirmant cette action, vous supprimerez la liste, ainsi que les produits de celui-ci',
      confirmCaption: 'Supprimer',
      cancelCaption: 'Annuler'
    }).subscribe((result) => {
      if (result) {
        this.listService.deleteList(Number(this.selectedList())).subscribe()
        location.reload();
      }
    })
  }

  onSearchChange(searchValue: string) {
    this.searchTerm.set(searchValue);
    this.pageIndex.set(0);
  }

  onClearSearch() {
    this.searchTerm.set('')
    this.pageIndex.set(0);
  }

  onRemoveFromList(product: ListProductDto) {
    this.dialogService.confirmDialog({
      title: 'Êtes vous sûr ?',
      message: 'En confirmant cette action, ce produit sera retiré de la liste',
      confirmCaption: 'Supprimer',
      cancelCaption: 'Annuler'
    }).subscribe((result) => {
      if (result) {
        this.listProductService.deleteListProduct(product.listProductId, this.selectedList()).subscribe()
      }
    })
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
  badgeBg(product: ListProductDto): string {
    const brand = product.storeBrand;
    if (brand) {
      if (brand.gradientColor) {
        return `linear-gradient(100deg, ${brand.bgColor} 0%, ${brand.bgColor} 55%, ${brand.gradientColor} 100%)`;
      }
      return brand.bgColor;
    }
    return this.fallbackColor(product.storeName);
  }

  badgeText(product: ListProductDto): string {
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

  readonly AppRoutes = AppRoutes;
  readonly referencePriceUnitLabel = referencePriceUnitLabel;
  readonly formatQuantity = formatQuantity;
}
