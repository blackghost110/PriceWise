import {Component, computed, DestroyRef, inject, OnInit, signal, ChangeDetectionStrategy} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatButton, MatIconButton} from '@angular/material/button';
import {MatLabel} from '@angular/material/form-field';
import {MatFormField, MatInput} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {ProductService} from '@features/catalog/service/product.service';
import {MatIcon} from '@angular/material/icon';
import {ProductsAllDto} from '@features/catalog/data/dto/products-all.dto';
import {formatQuantity} from '@features/catalog/data/dto/product.dto';

@Component({
  selector: 'app-search-product-dialog',
  imports: [
    MatDialogContent,
    MatDialogTitle,
    MatDialogActions,
    MatButton,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatFormField,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './search-product-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './search-product-dialog.css'
})
export class SearchProductDialog implements OnInit {
  destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<SearchProductDialog>);
  data = inject(MAT_DIALOG_DATA);

  // dialog injection
  selectedProduct = this.data.selectedProduct;

  productService = inject(ProductService)

  products = this.productService.allProducts
  selectedProducts = this.productService.selectedProducts

  searchTerm = signal('');


  ngOnInit() {
    this.productService.clearSelectedProducts();
    this.productService.getAllProducts().pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.productService.pushSelectedProduct(this.selectedProduct);
  }

  filteredProducts = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const rawProducts = this.products();

    let products = rawProducts?.filter(product => !this.selectedProducts().map(product => product.productId).includes(product.productId))

    if (!search || !products) {
      return products;
    }

    const searchTerms = search.split(' ').filter(term => term.length > 0);

    return products.filter(product => {
      const searchableText = [
        product.name,
        product.brand || '',
        product.quantity.toString(),
        product.unit,
        product.storeName,
        product.storeCity,
        product.storeStreet,
        product.storePostalCode,
        product.storeNumber,
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });

  })

  onAddCompare() {
    // Récupérer les IDs des produits sélectionnés (sauf le premier qui est le produit principal)
    const additionalProductIds = this.selectedProducts()
      .slice(1) // On skip le premier car c'est le produit principal déjà chargé
      .map(product => product.productId.toString());

    if (additionalProductIds.length > 0) {
      // Récupérer les détails de tous les produits supplémentaires
      this.productService.getMultipleProductDetails(additionalProductIds)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (products) => {
            // Ajouter le produit principal en premier
            const allProducts = [this.selectedProduct, ...products];
            this.productService.setComparisonProducts(allProducts);
            this.dialogRef.close({ compare: true });
          },
          error: (error) => {
            console.error('Erreur lors de la récupération des produits:', error);
          }
        });
    } else {
      // Si aucun produit supplémentaire, on ferme juste avec le produit principal
      this.productService.setComparisonProducts([this.selectedProduct]);
      this.dialogRef.close({ compare: true });
    }
  }

  onAddToSelectedProducts(product: ProductsAllDto) {
    this.productService.pushSelectedProduct(product);
  }

  onRemoveFromSelectedProducts(product: ProductsAllDto) {
    this.productService.removeSelectedProduct(product);
  }

  onSearchChange(searchValue: string) {
    this.searchTerm.set(searchValue);
  }

  onClearSearch() {
    this.searchTerm.set('')
  }


  onClose() {
    this.productService.clearSelectedProducts();
    this.dialogRef.close({ compare: false });
  }

  protected readonly formatQuantity = formatQuantity;

}
