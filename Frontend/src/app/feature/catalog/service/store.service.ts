import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StoreDto} from '@features/catalog/data/dto/store.dto';
import {CreatePricePayload} from '@features/catalog/data/payload/create-price.payload';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ApiService} from '@shared/api/service/api.service';
import {ApiResponse} from '@shared/api/data/api.response';
import {CreateProductPayload} from '@features/catalog/data/payload/create-product.payload';
import {CreateStorePayload} from '@features/catalog/data/payload/create-store.payload';

@Injectable({
  providedIn: 'root'
})
export class StoreService {

  private readonly api = inject(ApiService)


  private _storeList = signal<StoreDto[] | null>(null)
  storeList = this._storeList.asReadonly()

  private _selectedStore = signal<StoreDto | null>(null)
  selectedStore = this._selectedStore.asReadonly()


  getStores() {
    return this.api.get(`store`)
      .pipe(
        tap((response:ApiResponse) => {
          this._storeList.set(response.data);
          console.log(response)
        }),
        catchError(error => {
          return throwError(() => new Error(error));
        })
      )
  }

  getStore(storeId: number) {
    return this.api.get(`store/${storeId}`).pipe(
      tap((response:ApiResponse) => {
        this._selectedStore.set(response.data);
        console.log(response)
      })
    )
  }

  addStore(payload: CreateStorePayload) {
    return this.api.post(`store`, payload).pipe(
      tap((response:ApiResponse) => {
        console.log(response)
        if (response.result) {
          console.log('result true')
          this.getStores().subscribe()
        }
      })
    );
  }


}
