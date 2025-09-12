import {inject, Injectable, signal} from '@angular/core';
import {CreatePricePayload} from '@features/catalog/data/payload/create-price.payload';
import {HttpClient} from '@angular/common/http';
import {StoreDto} from '@features/catalog/data/dto/store.dto';
import {ApiService} from '@shared/api/service/api.service';

@Injectable({
  providedIn: 'root'
})
export class PriceService {

  api = inject(ApiService)


  addPrice(payload: CreatePricePayload, productId: number) {
    return this.api.post(`price/${productId}`, payload);
  }

}
