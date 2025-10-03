import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {Header} from '@core/layout/header/header';
import {StoreDto} from '@features/catalog/data/dto/store.dto';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {StoreService} from '@features/catalog/service/store.service';
import {MatButton, MatIconButton} from '@angular/material/button';

import {MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatDialog} from '@angular/material/dialog';
import {AddStoreDialog} from '@features/catalog/component/dialog/add-store-dialog/add-store-dialog';
import {MatIcon} from '@angular/material/icon';
import {AppNode} from '@shared/route/node.enum';
import {AppRoutes} from '@shared/route/app-routes.enum';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {AuthService} from '@core/auth/auth.service';
import {UpdateStoreDialog} from '@features/catalog/component/dialog/update-store-dialog/update-store-dialog';
import {Footer} from '@core/layout/footer/footer';
import {DialogService} from '@shared/component/confirm-dialog/dialog.service';

@Component({
  selector: 'app-store-list',
  imports: [
    Header,
    MatButton,
    MatIcon,
    MatFormField,
    MatInput,
    MatLabel,
    MatSuffix,
    RouterLink,
    RouterLinkActive,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    Footer,
  ],
  templateUrl: './store-list.html',
  styleUrl: './store-list.css'
})
export class StoreList implements OnInit{


  private readonly dialog = inject(MatDialog);

  private router = inject(Router)
  private destroyRef = inject(DestroyRef);
  private storeService = inject(StoreService);
  private authService = inject(AuthService);
  private dialogService = inject(DialogService);
  readonly AppRoutes = AppRoutes;


  stores = this.storeService.storeList
  storeLastTwo = this.storeService.storeLastTwo

  isAdmin = this.authService.isAdmin;
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  searchTerm = signal('');



  ngOnInit() {
    this.isLoading.set(true);
    this.storeService.getStores().pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe()
    this.storeService.getStoreLastTwo().pipe(takeUntilDestroyed(this.destroyRef))
    .subscribe()
  }

  filteredStores = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const stores = this.stores();

    if (!search || !stores) {
      return stores;
    }

    const searchTerms = search.split(' ').filter(term => term.length > 0);

    return stores.filter(product => {
      const searchableText = [
        product.name,
        product.street,
        product.city,
        product.postalCode,
        product.number,
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });

  })

  onSearchChange(searchValue: string) {
    this.searchTerm.set(searchValue);
  }


  onOpenDialogAddStore() {
    const dialogRef = this.dialog.open(AddStoreDialog, {
      data: {}
    });
  }
  onOpenDialogUpdateStore(store: StoreDto) {
    const dialogRef = this.dialog.open(UpdateStoreDialog, {
      data: {store: store}
    });
  }
  onOpenDialogDeleteStore(store: StoreDto) {
      this.dialogService.confirmDialog({
        title: 'Êtes vous sûr ?',
        message: 'En confirmant cette action, vous supprimerez le magasin, ainsi que les produits de celui-ci',
        confirmCaption: 'Supprimer',
        cancelCaption: 'Annuler'
      }).subscribe((result) => {
        if (result) {
          console.log('Suppression du magasin')
          this.storeService.deleteStore(+store.storeId).subscribe()
        }
      })

  }

  onNavigateToStore(store: StoreDto) {
    const route = AppRoutes.storeProductsPage(store.storeId);
    this.router.navigateByUrl(route, { state: { store } });
  }

  onClearSearch() {
    this.searchTerm.set('')
  }

  protected readonly AppNode = AppNode;
}
