import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, finalize } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { StoreDto } from '@features/catalog/data/dto/store.dto';
import {
  computeReferencePrice,
  formatQuantity,
  ProductDto,
  ProductUnitType,
  referencePriceUnitLabel
} from '@features/catalog/data/dto/product.dto';
import { ReceiptScanItemDto } from '@features/catalog/data/dto/receipt.dto';
import { ReceiptService } from '@features/catalog/service/receipt.service';
import { ProductService } from '@features/catalog/service/product.service';
import { ErrorMessageService } from '@shared/api/service/error-message.service';

interface ReviewRow {
  id: number;
  rawName: string;
  name: string;
  brand: string;
  unit: ProductUnitType;
  quantity: number;
  productPrice: number;
  referencePrice: number;
  matchProductId: number | null;
  matchedName: string | null;
  overrideProductId: number | null;
}

let nextRowId = 0;

/**
 * Popup de vérification affiché après le scan d'un ticket de caisse (déclenché depuis
 * AddProductDialog). Volontairement non fermable au clic sur le fond (`disableClose: true` côté
 * appelant) : le scan IA prend plusieurs secondes et modifie potentiellement plusieurs produits,
 * une fermeture accidentelle serait coûteuse à refaire.
 */
@Component({
  selector: 'app-receipt-review-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner,
    CurrencyPipe,
    FormsModule,
  ],
  templateUrl: './receipt-review-dialog.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './receipt-review-dialog.css',
})
export class ReceiptReviewDialog {

  private destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<ReceiptReviewDialog>);
  private data = inject(MAT_DIALOG_DATA);
  private receiptService = inject(ReceiptService);
  private productService = inject(ProductService);
  private errorMessageService = inject(ErrorMessageService);

  protected readonly referencePriceUnitLabel = referencePriceUnitLabel;
  protected readonly formatQuantity = formatQuantity;

  store: StoreDto = this.data.store;
  private storeId = Number(this.store.storeId);

  loading = signal(true);
  scanError = signal<string | null>(null);

  applying = signal(false);
  applyError = signal<string | null>(null);

  rows = signal<ReviewRow[]>([]);

  storeProducts = signal<ProductDto[]>([]);

  constructor() {
    this.productService.getProducts(this.storeId).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(products => this.storeProducts.set(products));

    this.receiptService.scan(this.storeId, { imageBase64: this.data.imageBase64, mimeType: this.data.mimeType }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.loading.set(false)),
      catchError((err: HttpErrorResponse) => {
        this.scanError.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data));
        return EMPTY;
      })
    ).subscribe(items => {
      this.rows.set(items.map(item => this.toRow(item)));
    });
  }

  private toRow(item: ReceiptScanItemDto): ReviewRow {
    return {
      id: nextRowId++,
      rawName: item.rawName,
      name: item.name,
      brand: item.brand,
      unit: item.unit,
      quantity: item.quantity,
      productPrice: item.productPrice,
      referencePrice: item.referencePrice,
      matchProductId: item.match.productId,
      matchedName: item.match.matchedName,
      overrideProductId: null,
    };
  }

  isExisting(row: ReviewRow): boolean {
    return (row.overrideProductId ?? row.matchProductId) !== null;
  }

  removeRow(id: number) {
    this.rows.update(rows => rows.filter(r => r.id !== id));
  }

  updateField(id: number, field: 'name' | 'brand' | 'quantity' | 'productPrice', rawValue: string) {
    this.rows.update(rows => rows.map(r => {
      if (r.id !== id) return r;
      const updated: ReviewRow = { ...r };
      switch (field) {
        case 'name':
          updated.name = rawValue;
          break;
        case 'brand':
          updated.brand = rawValue;
          break;
        case 'quantity':
          updated.quantity = Number(rawValue) || 0;
          break;
        case 'productPrice':
          updated.productPrice = Number(rawValue) || 0;
          break;
      }
      updated.referencePrice = computeReferencePrice(updated.productPrice, updated.quantity, updated.unit) ?? updated.referencePrice;
      return updated;
    }));
  }

  updateUnit(id: number, unit: string) {
    this.rows.update(rows => rows.map(r => {
      if (r.id !== id) return r;
      const updated: ReviewRow = { ...r, unit: unit as ProductUnitType };
      updated.referencePrice = computeReferencePrice(updated.productPrice, updated.quantity, updated.unit) ?? updated.referencePrice;
      return updated;
    }));
  }

  linkToProduct(id: number, productId: number | null) {
    this.rows.update(rows => rows.map(r => {
      if (r.id !== id) return r;
      if (productId === null) {
        return { ...r, overrideProductId: null };
      }
      const product = this.storeProducts().find(p => p.productId === productId);
      if (!product) return r;
      return {
        ...r,
        overrideProductId: productId,
        name: product.name,
        brand: product.brand ?? '',
        unit: product.unit,
        quantity: product.quantity,
        referencePrice: computeReferencePrice(r.productPrice, product.quantity, product.unit) ?? r.referencePrice,
      };
    }));
  }

  onClose() {
    this.dialogRef.close();
  }

  onApply() {
    const items = this.rows().map(r => ({
      productId: r.overrideProductId ?? r.matchProductId,
      name: r.name,
      brand: r.brand,
      unit: r.unit,
      quantity: r.quantity,
      productPrice: r.productPrice,
      referencePrice: r.referencePrice,
    }));

    if (items.length === 0) {
      this.dialogRef.close(true);
      return;
    }

    this.applying.set(true);
    this.applyError.set(null);

    this.receiptService.apply(this.storeId, { items }).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.applying.set(false)),
      catchError((err: HttpErrorResponse) => {
        this.applyError.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data));
        return EMPTY;
      })
    ).subscribe(() => {
      this.dialogRef.close(true);
    });
  }
}
