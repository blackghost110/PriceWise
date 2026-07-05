import {Component, computed, effect, inject, input, OnInit, signal, ChangeDetectionStrategy} from '@angular/core';
import {BaseChartDirective} from 'ng2-charts';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import {ChartConfiguration} from 'chart.js';
import { ProductService} from '@features/catalog/service/product.service';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormField} from '@angular/material/form-field';
import {MatLabel} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatButton, MatFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {SearchProductDialog} from '@features/catalog/component/dialog/search-product-dialog/search-product-dialog';
import {MatDialog} from '@angular/material/dialog';
import {CurrencyPipe, Location} from '@angular/common';
import {AddPriceDialog} from '@features/catalog/component/dialog/add-price-dialog/add-price-dialog';
import {
  AddProductToListDialog
} from '@features/catalog/component/dialog/add-product-to-list-dialog/add-product-to-list-dialog';
import {AppNode} from '@shared/route/node.enum';
import {AppRoutes} from '@shared/route/app-routes.enum';
import {referencePriceUnitLabel} from '@features/catalog/data/dto/product.dto';
import {SnackbarService} from '@shared/service/snackbar.service';

@Component({
  selector: 'app-product-detail',
  imports: [BaseChartDirective, Header, Footer, FormsModule, MatFormField, MatLabel, MatOption, MatSelect, ReactiveFormsModule, MatFabButton, MatIcon, MatButton, CurrencyPipe],
  templateUrl: './product-detail.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit{

  productService = inject(ProductService);
  dialog = inject(MatDialog);
  snackbar = inject(SnackbarService);

  // dynamic url
  productId = input.required<string>();

  productDetail = this.productService.productDetail;
  comparisonProducts = this.productService.comparisonProducts;

  timelineFilter = signal('0');
  priceTypeFilter = signal('product'); // product ou gross

  numberOfPrice = computed(() => this.productDetail()?.prices.length ?? 0);
  readonly AppRoutes = AppRoutes;

  ngOnInit() {

    this.productService.clearSelectedProducts();
    this.productService.clearComparisonProducts();
    this.productService.getProductDetail(this.productId()).subscribe({
      next: (product) => {
        this.productService.setComparisonProducts([product]);
      },
      error: () => {
        this.snackbar.show('Ce produit n\'existe pas ou n\'est plus disponible');
        this.location.back();
      }
    })

  }

  constructor(public location: Location) {
    effect(() => {
      this.timelineFilter();
      this.priceTypeFilter();
      this.comparisonProducts();
      this.updateGraphComparison();
    });
  }


  productChartData = signal<ChartConfiguration['data']>({
    labels: [],
    datasets: []
  });


  productChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {display: true, text: 'Mois'},
        ticks: {
          maxTicksLimit: 10,
        }
      },
      y: {
        beginAtZero: true,
        title: {display: true, text: 'Prix (€)'},
        grace: '15%'
      },
    },
    plugins: {
      legend: {
        display: true
      },
      tooltip: {
        callbacks: {
          title: (context) => {
            // Titre du tooltip (généralement la date/mois)
            return context[0].label;
          },
          label: (context) => {
            const datasetIndex = context.datasetIndex;
            const product = this.comparisonProducts()[datasetIndex]; // Assuming you have access to your products array

            return [
              ` ${product.name} ${product.brand ? '- ' + product.brand : ''} ${product.quantity}${product.unit}`,
              ` Prix: ${context.parsed.y}€`,
              ` ${product.storeName} - ${product.storeCity} ${product.storePostalCode} ${product.storeStreet} ${product.storeNumber}`,
              ` `
            ];
          },

        }
      }
    },
    interaction: {intersect: false, mode: 'index'}
  };


  updateGraphComparison() {
    const products = this.comparisonProducts();

    if (!products || products.length === 0) {
      return;
    }

    // Trouver toutes les dates uniques parmi tous les produits
    const allDates = new Set<string>();
    const processedProducts = products.map(product => {
      const normalizedPrices = this.productService.fillPriceGaps(product.prices);
      normalizedPrices.forEach(price => allDates.add(price.priceDate));
      return {
        ...product,
        prices: normalizedPrices
      };
    });

    // Trier les dates
    const sortedDates = Array.from(allDates).sort((a, b) => a.localeCompare(b)); //VERIF si elle compare correctement

    // Appliquer le filtre de timeline (on garde les N derniers jours, pas les premiers)
    const filteredDates = this.timelineFilter() === '0'
      ? sortedDates
      : sortedDates.slice(-(+this.timelineFilter() * 30));

    // Créer les datasets pour chaque produit
    const datasets = processedProducts.map((product, index) => {
      // Créer un map pour accès rapide aux prix par date
      const priceMap = new Map(
        product.prices.map(price => [price.priceDate, price])
      );

      // Créer les données alignées sur les dates filtrées
      const data = filteredDates.map(date => {
        const price = priceMap.get(date);
        if (!price) return null;

        // priceId === 0 signale un trou comblé par fillPriceGaps, pas un vrai prix à 0€
        if (this.priceTypeFilter() === 'product') {
          return price.priceId === 0 ? null : price.productPrice;
        } else {
          return price.priceId === 0 ? null : price.referencePrice;
        }
      });

      return {
        label: `${product.name} ${product.brand ? '- ' + product.brand : ''} ${product.quantity}${product.unit} (${product.storeName})`,
        data: data,
        borderColor: this.getColorForIndex(index),
        backgroundColor: this.getColorForIndex(index),
        fill: false,
        tension: 0.2,
        pointRadius: 3,
        pointBorderColor: 'white',
        pointHoverRadius: 5,
        pointBorderWidth: 2,
        pointHoverBackgroundColor: this.getColorForIndex(index),
        spanGaps: true
      };
    });

    this.productChartData.update(data => ({
      ...data,
      labels: filteredDates,
      datasets: datasets
    }));
  }


  onOpenDialogAddPrice(product: any,) {
    const dialogRef = this.dialog.open(AddPriceDialog, {
      data: {product: product}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        window.location.reload();
      }
    });
  }

  private getColorForIndex(index: number): string {
    const colors = ['#8d1a36', '#3333D7', '#228B22', '#666600', '#a064a0', 'gray', '#068383', '#ff7f00'];
    return colors[index % colors.length];
  }

  onOpenDialogSearchProduct() {
    this.dialog.open(SearchProductDialog, {
      disableClose: true,
      data: {selectedProduct: this.productDetail()!}
    });
  }

  onOpenDialogAddToList(product: any,) {
    const dialogRef = this.dialog.open(AddProductToListDialog, {
      data: {product: product}
    });
  }


  protected readonly AppNode = AppNode;
  protected readonly referencePriceUnitLabel = referencePriceUnitLabel;
}





