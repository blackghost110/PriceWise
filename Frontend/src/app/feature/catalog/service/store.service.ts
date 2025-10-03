import {inject, Injectable, signal} from '@angular/core';
import {StoreDto} from '@features/catalog/data/dto/store.dto';
import {catchError, tap, throwError} from 'rxjs';
import {ApiService} from '@shared/api/service/api.service';
import {ApiResponse} from '@shared/api/data/api.response';
import {CreateStorePayload} from '@features/catalog/data/payload/create-store.payload';
import {ApiURI} from '@shared/api/api-uri.enum';
import {UpdateStorePayload} from '@features/catalog/data/payload/update-store.payload';
import {SnackbarService} from '@shared/service/snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private readonly api = inject(ApiService)
  private snackbar = inject(SnackbarService)


  private _storeLastTwo = signal<StoreDto[] | null>(null)
  storeLastTwo = this._storeLastTwo.asReadonly()

  private _selectedStore = signal<StoreDto | null>(null)
  selectedStore = this._selectedStore.asReadonly()

  private _storeList = signal<StoreDto[] | null>(null)
  storeList = this._storeList.asReadonly()

  getStores() {
    return this.api.get(ApiURI.STORE_GET_ALL)
      .pipe(
        tap((response:ApiResponse) => {
          this._storeList.set(response.data);
          console.log(response)
        })
      )
  }

  addStore(payload: CreateStorePayload) {
    return this.api.post(ApiURI.STORE_CREATE, payload).pipe(
      tap((response:ApiResponse) => {
        console.log(response)
        if (response.result) {
          this.getStores().subscribe()
            this.snackbar.show('Magasin ajouté avec succès');
        }
      })
    );
  }

  getStoreLastTwo() {
    return this.api.get(`${ApiURI.STORE_GET_TWO}`)
      .pipe(
        tap((response:ApiResponse) => {
          this._storeLastTwo.set(response.data);
          console.log(response)
        }),
        catchError(error => {
          return throwError(() => new Error(error));
        })
      )
  }

  getStore(storeId: number) {
    return this.api.get(`${ApiURI.STORE_GET}/${storeId}`).pipe(
      tap((response:ApiResponse) => {
        this._selectedStore.set(response.data);
        console.log(response)
      })
    )
  }

  updateStore(payload: UpdateStorePayload, storeId: number) {
    return this.api.put(`${ApiURI.STORE_UPDATE}/${storeId}`, payload).pipe(
      tap((response:ApiResponse) => {
        console.log(response)
        if (response.result) {
          this.getStores().subscribe()
          this.snackbar.show('Magasin modifié avec succès');
        }
      })
    );
  }

  deleteStore(storeId: number) {
    return this.api.delete(`${ApiURI.STORE_DELETE}/${storeId}`).pipe(
      tap((response:ApiResponse) => {
        console.log(response)
        if (response.result) {
          this.getStores().subscribe()
          this.snackbar.show('Magasin supprimé avec succès');
        }
      })
    );
  }


}
