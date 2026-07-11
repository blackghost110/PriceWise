import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { ApiService } from '@shared/api/service/api.service';
import { ApiURI } from '@shared/api/api-uri.enum';
import { SnackbarService } from '@shared/service/snackbar.service';
import { ScanReceiptPayload } from '@features/catalog/data/payload/scan-receipt.payload';
import { ApplyReceiptPayload } from '@features/catalog/data/payload/apply-receipt.payload';
import { ReceiptApplyResultDto, ReceiptScanItemDto } from '@features/catalog/data/dto/receipt.dto';
import { ProductService } from '@features/catalog/service/product.service';

@Injectable({
  providedIn: 'root'
})
export class ReceiptService {

  private readonly api = inject(ApiService);
  private snackbar = inject(SnackbarService);
  private productService = inject(ProductService);

  scan(storeId: number, payload: ScanReceiptPayload) {
    return this.api.post<ReceiptScanItemDto[]>(`${ApiURI.RECEIPT_SCAN}/${storeId}`, payload);
  }

  apply(storeId: number, payload: ApplyReceiptPayload) {
    return this.api.post<ReceiptApplyResultDto>(`${ApiURI.RECEIPT_APPLY}/${storeId}`, payload).pipe(
      tap((result) => {
        this.productService.getProducts(storeId).subscribe();

        const parts: string[] = [];
        if (result.created) parts.push(`${result.created} produit(s) ajouté(s)`);
        if (result.updated) parts.push(`${result.updated} prix mis à jour`);
        if (result.skipped) parts.push(`${result.skipped} ligne(s) ignorée(s)`);
        this.snackbar.show(parts.length ? parts.join(', ') : 'Ticket appliqué avec succès');
      })
    );
  }

}
