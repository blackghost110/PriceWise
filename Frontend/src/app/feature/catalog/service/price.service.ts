import {inject, Injectable} from '@angular/core';
import {CreatePricePayload} from '@features/catalog/data/payload/create-price.payload';
import {ApiService} from '@shared/api/service/api.service';
import {UpdatePricePayload} from '@features/catalog/data/payload/update-price.payload';
import {ApiURI} from '@shared/api/api-uri.enum';
import {SnackbarService} from '@shared/service/snackbar.service';
import {tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PriceService {

  private readonly api = inject(ApiService)
  private snackbar = inject(SnackbarService)


  addPrice(payload: CreatePricePayload, productId: number) {
    return this.api.post(`${ApiURI.PRICE_CREATE}/${productId}`, payload).pipe(
      tap(() => {
        this.snackbar.show('Prix ajouté avec succès');
      })
    );
  }

  updatePrice(payload: UpdatePricePayload, priceId: number) {
    return this.api.put(`${ApiURI.PRICE_UPDATE}/${priceId}`, payload).pipe(
      tap(() => {
        this.snackbar.show('Prix modifié avec succès');
      })
    );
  }

}
