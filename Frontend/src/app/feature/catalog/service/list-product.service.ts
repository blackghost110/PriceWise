import {inject, Injectable, signal} from '@angular/core';
import {ApiService} from '@shared/api/service/api.service';
import {ListDto} from '@features/catalog/data/dto/list.dto';
import {catchError, tap, throwError} from 'rxjs';
import {ApiResponse} from '@shared/api/data/api.response';
import {ListProductDto} from '@features/catalog/data/dto/list-product.dto';

@Injectable({
  providedIn: 'root'
})
export class ListProductService {

  private readonly api = inject(ApiService)


  private _listProducts = signal<ListProductDto[] | null>(null)
  listProducts = this._listProducts.asReadonly()


  getListProducts(listId: number) {
    return this.api.get(`list-product/${listId}`)
      .pipe(
        tap((response: ApiResponse) => {
          this._listProducts.set(response.data);
          console.log(response)
        }),
        catchError(error => {
          return throwError(() => new Error(error));
        })
      )
  }

  clearListProducts() {
    this._listProducts.set(null)
  }


}
