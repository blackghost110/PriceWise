import {inject, Injectable, signal} from '@angular/core';
import {ApiService} from '@shared/api/service/api.service';
import {StoreDto} from '@features/catalog/data/dto/store.dto';
import {catchError, tap, throwError} from 'rxjs';
import {ApiResponse} from '@shared/api/data/api.response';
import {CreateStorePayload} from '@features/catalog/data/payload/create-store.payload';
import {ListDto} from '@features/catalog/data/dto/list.dto';
import {CreateListPayload} from '@features/catalog/data/payload/create-list.payload';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  private readonly api = inject(ApiService)


  private _personalList = signal<ListDto[] | null>(null)
  personalList = this._personalList.asReadonly()



  getLists() {
    return this.api.get(`list/user`)
      .pipe(
        tap((response:ApiResponse) => {
          this._personalList.set(response.data);
          console.log(response)
        }),
        catchError(error => {
          return throwError(() => new Error(error));
        })
      )
  }

  // getStore(storeId: number) {
  //   return this.api.get(`store/${storeId}`).pipe(
  //     tap((response:ApiResponse) => {
  //       this._selectedStore.set(response.data);
  //       console.log(response)
  //     })
  //   )
  // }

  addList(payload: CreateListPayload) {
    return this.api.post(`list`, payload).pipe(
      tap((response:ApiResponse) => {
        console.log(response)
        if (response.result) {
          this.getLists().subscribe()
        }
      })
    );
  }
  updateList(payload: CreateListPayload, listId: number) {
    return this.api.put(`list/${listId}`, payload).pipe(
      tap((response:ApiResponse) => {
        console.log(response)
        if (response.result) {
          this.getLists().subscribe()
        }
      })
    );
  }
  deleteList(listId: number) {
    return this.api.delete(`list/${listId}`).pipe(
      tap((response:ApiResponse) => {
        console.log(response)
        if (response.result) {
          this.getLists().subscribe()
        }
      })
    );
  }


}
