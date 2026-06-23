import {inject, Injectable, signal} from '@angular/core';
import {ApiService} from '@shared/api/service/api.service';
import {tap} from 'rxjs';
import {ListDto} from '@features/catalog/data/dto/list.dto';
import {CreateListPayload} from '@features/catalog/data/payload/create-list.payload';
import {ApiURI} from '@shared/api/api-uri.enum';
import {SnackbarService} from '@shared/service/snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class ListService {

  private readonly api = inject(ApiService)
  private snackbar = inject(SnackbarService)


  private _personalList = signal<ListDto[] | null>(null)
  personalList = this._personalList.asReadonly()



  getLists() {
    return this.api.get<ListDto[]>(`${ApiURI.LIST_GET_ALL}`)
      .pipe(
        tap((lists) => this._personalList.set(lists))
      )
  }

  addList(payload: CreateListPayload) {
    return this.api.post(`${ApiURI.LIST_CREATE}`, payload).pipe(
      tap(() => {
        this.getLists().subscribe()
        this.snackbar.show('Liste ajoutée avec succès');
      })
    );
  }
  updateList(payload: CreateListPayload, listId: number) {
    return this.api.put(`${ApiURI.LIST_UPDATE}/${listId}`, payload).pipe(
      tap(() => {
        this.getLists().subscribe()
        this.snackbar.show('Liste mise à jour avec succès');
      })
    );
  }
  deleteList(listId: number) {
    return this.api.delete(`${ApiURI.LIST_DELETE}/${listId}`).pipe(
      tap(() => {
        this.getLists().subscribe()
        this.snackbar.show('Liste supprimée avec succès');
      })
    );
  }


}
