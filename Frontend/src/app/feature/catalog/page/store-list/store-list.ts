import {Component, computed, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Header} from '@core/layout/header/header';
import {StoreDto} from '@features/catalog/data/dto/store.dto';
import {Router, RouterLink} from '@angular/router';
import {ProductDto} from '@features/catalog/data/dto/product.dto';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {StoreService} from '@features/catalog/service/store.service';
import {MatButton} from '@angular/material/button';

import {MatFormField, MatInput, MatLabel, MatPrefix, MatSuffix} from '@angular/material/input';
import {AddProductDialog} from '@features/catalog/component/add-product-dialog/add-product-dialog';
import {MatDialog} from '@angular/material/dialog';
import {AddStoreDialog} from '@features/catalog/component/add-store-dialog/add-store-dialog';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-store-list',
  imports: [
    Header,
    MatButton,
    MatIcon,
    MatFormField,
    MatInput,
    MatLabel,
    RouterLink,
  ],
  templateUrl: './store-list.html',
  styleUrl: './store-list.css'
})
export class StoreList implements OnInit{


  private readonly dialog = inject(MatDialog);

  private router = inject(Router)
  private destroyRef = inject(DestroyRef);
  private storeService = inject(StoreService);



  stores = this.storeService.storeList

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  searchTerm = signal('');


  ngOnInit() {
    this.isLoading.set(true);
    this.storeService.getStores().pipe(takeUntilDestroyed(this.destroyRef))
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
    this.router.navigate([`/store-list/${store.storeId}/products`],
      { state: { store } })
  }

  onClearSearch() {
    this.searchTerm.set('')
  }

}
