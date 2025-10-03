import {inject, Injectable, signal} from '@angular/core';
import {ApiService} from '@shared/api/service/api.service';
import { tap} from 'rxjs';
import {ApiResponse} from '@shared/api/data/api.response';
import {ListProductDto} from '@features/catalog/data/dto/list-product.dto';
import {CreateListProductPayload} from '@features/catalog/data/payload/create-list-product.payload';
import {ApiURI} from '@shared/api/api-uri.enum';
import {SnackbarService} from '@shared/service/snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class ListProductService {

  private readonly api = inject(ApiService)
  private snackbar = inject(SnackbarService)


  private _listProducts = signal<ListProductDto[] | null>(null)
  listProducts = this._listProducts.asReadonly()


  getListProducts(listId: number) {
    return this.api.get(`${ApiURI.LIST_PRODUCT_GET_ALL}/${listId}`)
      .pipe(
        tap((response: ApiResponse) => {
          this._listProducts.set(response.data);
          console.log(response)
        })
      )
  }

  addProductToList(payload: CreateListProductPayload) {
    return this.api.post(`${ApiURI.LIST_PRODUCT_CREATE}`, payload).pipe(
      tap((response:ApiResponse) => {
        console.log(response)
        if (response.result) {
          this.snackbar.show('Produit ajouté avec succès');
        }
      })
    );
  }


  clearListProducts() {
    this._listProducts.set(null)
  }

}
