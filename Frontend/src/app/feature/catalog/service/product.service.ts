import {inject, Injectable, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {StoreDto} from '@features/catalog/data/dto/store.dto';
import {catchError, Observable, tap, throwError} from 'rxjs';
import {ProductDto} from '@features/catalog/data/dto/product.dto';
import {ApiService} from '@shared/api/service/api.service';
import {ApiResponse} from '@shared/api/data/api.response';
import {CreatePricePayload} from '@features/catalog/data/payload/create-price.payload';
import {CreateProductPayload} from '@features/catalog/data/payload/create-product.payload';
import {ProductsAllDto} from '@features/catalog/data/dto/products-all.dto';
import {ProductDetail} from '@features/catalog/page/product-detail/product-detail';
import {ProductDetailDto} from '@features/catalog/data/dto/product-detail.dto';
import {PriceDto} from '@features/catalog/data/dto/price.dto';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private api = inject(ApiService)


  private _storeProducts = signal<ProductDto[] | null>(null)
  storeProducts = this._storeProducts.asReadonly()

  private _allProducts = signal<ProductsAllDto []| null>(null)
  allProducts = this._allProducts.asReadonly()

  private _productDetail = signal<ProductDetailDto >({
    productId: 0,
    name: '',
    brand: '',
    unit: '',
    quantity: 0,
    storeName: '',
    storeStreet: '',
    storeNumber: '',
    storePostalCode: '',
    storeCity: '',
    prices: []
  });
  productDetail = this._productDetail.asReadonly()

  private _selectedProducts = signal<ProductsAllDto[]>([])
  selectedProducts = this._selectedProducts.asReadonly()




  pushSelectedProduct(product: ProductsAllDto) {
    this._selectedProducts.update(current => [...current, product]);
  }
  clearSelectedProducts() {
    this._selectedProducts.update(() => []);
  }
  removeSelectedProduct(productToDelete: ProductsAllDto) {
    this._selectedProducts.update(current => current.filter(product => product.productId !== productToDelete.productId));
  }



  getProductDetail(productId: string) {
    return this.api.get(`product/${productId}`)
      .pipe(
        tap((response:ApiResponse) => {
          this._productDetail.set(response.data);
          console.log(response)
        })
      )
  }

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


  fillPriceGaps(prices: PriceDto[]): PriceDto[] {
    if (prices.length === 0) return [];

    const normalizedPrices = prices.map(price => {
      const [year, month, day] = price.priceDate.split('-').map(Number);
      return {
      ...price,
        priceDate: new Date(year, month - 1, day),
      };

    })



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
          grossPrice: 0,
          priceDate: dateStr // Convertir en Date comme attendu par l'interface --------------
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return filledPrices;
  }

}

