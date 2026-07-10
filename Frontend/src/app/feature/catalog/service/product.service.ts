import {inject, Injectable, signal} from '@angular/core';
import { forkJoin, Observable, tap} from 'rxjs';
import {ProductDto} from '@features/catalog/data/dto/product.dto';
import {ApiService} from '@shared/api/service/api.service';
import {CreateProductPayload} from '@features/catalog/data/payload/create-product.payload';
import {ProductsAllDto} from '@features/catalog/data/dto/products-all.dto';
import {ProductDetailDto} from '@features/catalog/data/dto/product-detail.dto';
import {ProductLookupDto} from '@features/catalog/data/dto/product-lookup.dto';
import {PriceDto} from '@features/catalog/data/dto/price.dto';
import {ApiURI} from '@shared/api/api-uri.enum';
import {SnackbarService} from '@shared/service/snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private readonly api = inject(ApiService)
  private snackbar = inject(SnackbarService)


  private _storeProducts = signal<ProductDto[] | null>(null)
  storeProducts = this._storeProducts.asReadonly()

  private _allProducts = signal<ProductsAllDto []| null>(null)
  allProducts = this._allProducts.asReadonly()

  private _productDetail = signal<ProductDetailDto | null>(null);
  productDetail = this._productDetail.asReadonly()

  private _selectedProducts = signal<ProductsAllDto[]>([])
  selectedProducts = this._selectedProducts.asReadonly()




  pushSelectedProduct(product: ProductsAllDto) {
    if (this._selectedProducts().length < 8)
    this._selectedProducts.update(current => [...current, product]);
  }
  clearSelectedProducts() {
    this._selectedProducts.update(() => []);
  }
  removeSelectedProduct(productToDelete: ProductsAllDto) {
    this._selectedProducts.update(current => current.filter(product => product.productId !== productToDelete.productId));
  }



  getProductDetail(productId: string) {
    return this.api.get<ProductDetailDto>(`${ApiURI.PRODUCT_DETAIL}/${productId}`)
      .pipe(
        tap((product) => this._productDetail.set(product))
      )
  }

  getProducts(storeId: number) {
    const endpoint = ApiURI.PRODUCT_GET_BY_STORE.replace(':storeId', storeId.toString());
    return this.api.get<ProductDto[]>(endpoint)
      .pipe(
        tap((products) => this._storeProducts.set(products))
      )
  }

  // Mise à jour pour accepter les paramètres de requête
  getAllProducts(filters?: { storeName?: string; storePostalCode?: string }) {
    let url = 'products';

    // Construction des paramètres de requête
    if (filters && (filters.storeName || filters.storePostalCode)) {
      const params = new URLSearchParams();
      if (filters.storeName) {
        params.append('storeName', filters.storeName);
      }
      if (filters.storePostalCode) {
        params.append('storePostalCode', filters.storePostalCode);
      }
      url += `?${params.toString()}`;
    }

    return this.api.get<ProductsAllDto[]>(url)
      .pipe(
        tap((products) => this._allProducts.set(products))
      )
  }

  lookupByEan(ean: string) {
    return this.api.get<ProductLookupDto>(`${ApiURI.PRODUCT_LOOKUP}/${ean}`);
  }

  addProduct(payload: CreateProductPayload, storeId: number) {
    return this.api.post(`${ApiURI.PRODUCT_CREATE}/${storeId}`, payload).pipe(
      tap(() => {
        this.getProducts(storeId).subscribe()
        this.snackbar.show('Produit ajouté avec succès');
      })
    );
  }

  deleteProduct(productId: number, storeId: number) {
    return this.api.delete(`${ApiURI.PRODUCT_DELETE}/${productId}`).pipe(
      tap(() => {
        this.getProducts(storeId).subscribe()
        this.snackbar.show('Produit supprimé avec succès');
      })
    );
  }





  private _comparisonProducts = signal<ProductDetailDto[]>([]);
  comparisonProducts = this._comparisonProducts.asReadonly();
// Nouvelles méthodes pour gérer les produits de comparaison

  setComparisonProducts(products: ProductDetailDto[]) {
    this._comparisonProducts.set(products);
  }
  clearComparisonProducts() {
    this._comparisonProducts.set([]);
  }

// Méthode pour récupérer les détails de plusieurs produits


  getMultipleProductDetails(productIds: string[]): Observable<ProductDetailDto[]> {
    const requests = productIds.map(id =>
      this.api.get<ProductDetailDto>(`${ApiURI.PRODUCT_MULTIPLE_DETAIL}/${id}`)
    );

    return forkJoin(requests);
  }







  fillPriceGaps(prices: PriceDto[]): PriceDto[] {
    if (prices.length === 0) return [];

    // Trier les prix par date (les dates sont des strings du backend)
    const sortedPrices = [...prices].sort((a, b) =>
      new Date(a.priceDate).getTime() - new Date(b.priceDate).getTime()
    );

    // Créer un Map des prix existants par date
    const priceMap = new Map<string, PriceDto>();
    sortedPrices.forEach(price => {
      const dateStr = price.priceDate.toString().split('T')[0];
      priceMap.set(dateStr, price);
    });

    // Générer toutes les dates entre la première et la dernière
    const startDate = new Date(sortedPrices[0].priceDate);
    const endDate = new Date(sortedPrices[sortedPrices.length - 1].priceDate);

    const filledPrices: PriceDto[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];

      if (priceMap.has(dateStr)) {
        // Ajouter le prix existant
        filledPrices.push(priceMap.get(dateStr)!);
      } else {
        // Ajouter un prix vide pour la date manquante
        filledPrices.push({
          priceId: 0, // ou -1 pour indiquer que c'est un prix fictif
          productPrice: 0, // ou null si votre interface le permet
          referencePrice: 0,
          priceDate: dateStr // Convertir en Date comme attendu par l'interface --------------
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return filledPrices;
  }



}

