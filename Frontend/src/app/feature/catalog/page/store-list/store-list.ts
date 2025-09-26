import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {Header} from '@core/layout/header/header';
import {StoreDto} from '@features/catalog/data/dto/store.dto';
import {Router, RouterLink, RouterLinkActive} from '@angular/router';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {StoreService} from '@features/catalog/service/store.service';
import {MatButton} from '@angular/material/button';

import {MatFormField, MatInput, MatLabel, MatSuffix} from '@angular/material/input';
import {MatDialog} from '@angular/material/dialog';
import {AddStoreDialog} from '@features/catalog/component/dialog/add-store-dialog/add-store-dialog';
import {MatIcon} from '@angular/material/icon';
import {AppNode} from '@shared/route/node.enum';
import {AppRoutes} from '@shared/route/app-routes.enum';

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
  ],
  templateUrl: './store-list.html',
  styleUrl: './store-list.css'
})
export class StoreList implements OnInit{


  private readonly dialog = inject(MatDialog);

  private router = inject(Router)
  private destroyRef = inject(DestroyRef);
  private storeService = inject(StoreService);
  readonly AppRoutes = AppRoutes;


  stores = this.storeService.storeList
  storeLastTwo = this.storeService.storeLastTwo

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

  onNavigateToStore(store: StoreDto) {
    const route = AppRoutes.storeProductsPage(store.storeId);
    this.router.navigateByUrl(route, { state: { store } });
  }

  onClearSearch() {
    this.searchTerm.set('')
  }

  protected readonly AppNode = AppNode;
}
