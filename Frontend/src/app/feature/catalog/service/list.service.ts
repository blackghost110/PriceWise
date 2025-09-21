import {inject, Injectable, signal} from '@angular/core';
import {ApiService} from '@shared/api/service/api.service';
import {catchError, tap, throwError} from 'rxjs';
import {ApiResponse} from '@shared/api/data/api.response';
import {ListDto} from '@features/catalog/data/dto/list.dto';
import {CreateListPayload} from '@features/catalog/data/payload/create-list.payload';
import {ApiURI} from '@shared/api/api-uri.enum';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  private readonly api = inject(ApiService)


  private _personalList = signal<ListDto[] | null>(null)
  personalList = this._personalList.asReadonly()



  getLists() {
    return this.api.get(`${ApiURI.LIST_GET_ALL}`)
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

  addList(payload: CreateListPayload) {
    return this.api.post(`${ApiURI.LIST_CREATE}`, payload).pipe(
      tap((response:ApiResponse) => {
        console.log(response)
        if (response.result) {
          this.getLists().subscribe()
        }
      })
    );
  }
  updateList(payload: CreateListPayload, listId: number) {
    return this.api.put(`${ApiURI.LIST_UPDATE}/${listId}`, payload).pipe(
      tap((response:ApiResponse) => {
        console.log(response)
        if (response.result) {
          this.getLists().subscribe()
        }
      })
    );
  }
  deleteList(listId: number) {
    return this.api.delete(`${ApiURI.LIST_DELETE}/${listId}`).pipe(
      tap((response:ApiResponse) => {
        console.log(response)
        if (response.result) {
          this.getLists().subscribe()
        }
      })
    );
  }


}
