import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StoreDto} from '@features/catalog/data/dto/store.dto';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {ProductDto} from '@features/catalog/data/dto/product.dto';
import {ApiService} from '@shared/api/service/api.service';
import {ApiResponse} from '@shared/api/data/api.response';
import {CreatePricePayload} from '@features/catalog/data/payload/create-price.payload';
import {CreateProductPayload} from '@features/catalog/data/payload/create-product.payload';
import {ProductAllDto} from '@features/catalog/data/dto/product-all.dto';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private api = inject(ApiService)


  private _storeProducts = signal<ProductDto[] | null>(null)
  storeProducts = this._storeProducts.asReadonly()

  private _allProducts = signal<ProductAllDto []| null>(null)
  allProducts = this._allProducts.asReadonly()


  getProducts(storeId: number) {
    return this.api.get(`store/${storeId}/products`)
      .pipe(
        tap((response:ApiResponse) => {
          this._storeProducts.set(response.data);
          console.log(response)
        })
      )
  }

  getAllProducts() {
    return this.api.get(`products`)
      .pipe(
        tap((response:ApiResponse) => {
          this._allProducts.set(response.data);
          console.log(response)
        })
      )
  }





  addProduct(payload: CreateProductPayload, storeId: number) {
    return this.api.post(`product/${storeId}`, payload).pipe(
      tap((response:ApiResponse) => {
        console.log('tap addproduct')
        console.log(response)
        if (response.result) {
          console.log('result true')
          this.getProducts(storeId).subscribe()
        }
      })
    );
  }


}
