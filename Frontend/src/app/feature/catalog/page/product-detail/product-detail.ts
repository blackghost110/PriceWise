import {Component, computed, effect, inject, input, OnInit, signal} from '@angular/core';
import {BaseChartDirective} from 'ng2-charts';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import {ChartConfiguration} from 'chart.js';
import { ProductService} from '@features/catalog/service/product.service';
import {ProductDetailDto} from '@features/catalog/data/dto/product-detail.dto';
import {PriceDto} from '@features/catalog/data/dto/price.dto';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatFormField} from '@angular/material/form-field';
import {MatLabel} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatFabButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {AddStoreDialog} from '@features/catalog/component/dialog/add-store-dialog/add-store-dialog';
import {SearchProductDialog} from '@features/catalog/component/dialog/search-product-dialog/search-product-dialog';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-product-detail',
  imports: [BaseChartDirective, Header, Footer, FormsModule, MatFormField, MatLabel, MatOption, MatSelect, ReactiveFormsModule, MatFabButton, MatIcon],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css'
})
export class ProductDetail implements OnInit{

  productService = inject(ProductService);
  dialog = inject(MatDialog);

  // dynamic url
  productId = input.required<string>();

  productDetail = this.productService.productDetail;

  timelineFilter = signal('0'); // 0 = All-Time, 1 = 1 year, etc.
  quarterFilter = signal('all'); // all, q1, q2, q3, q4, ou mois spécifique
  priceTypeFilter = signal('product'); // product ou gross


  ngOnInit() {
    this.productService.getProductDetail(this.productId()).subscribe({
      next: () => this.updateGraphProduct(this.productDetail())
    })

  }

  constructor() {
    effect(() => {
        this.timelineFilter();
        this.quarterFilter();
        this.priceTypeFilter();
        this.updateGraphProduct(this.productDetail())
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
      }
    },
    interaction: {intersect: false, mode: 'index'}
  };

  updateGraphProduct(product: ProductDetailDto) {
    console.log('product', product)

    const normalizedPrices: PriceDto[] = this.productService.fillPriceGaps(product.prices);
    console.log('normalizedPrices', normalizedPrices);

    const normalizedProduct: ProductDetailDto = {
      ...product,
      prices: normalizedPrices
    }


    this.productChartData.update(data => ({
      ...data,
      labels: normalizedProduct.prices.map(price => price.priceDate).slice(-this.timelineFilter() * 30),
      datasets: [
        {
        label: this.priceTypeFilter() === 'product' ? 'prix du produit' : 'prix brut',
        data: this.priceTypeFilter() === 'product' ? (normalizedProduct.prices.map(price => price.productPrice === 0 ? null : price.productPrice).slice(-this.timelineFilter() * 30))
          : (normalizedProduct.prices.map(price => price.grossPrice === 0 ? null : price.grossPrice).slice(-this.timelineFilter() * 30)),
        borderColor: '#3CB371',
        backgroundColor: '#3CB371',
        fill: false,
        tension: 0.2,
        pointRadius: 5,
        pointBorderColor: 'white',
        pointHoverRadius: 5,
        pointBorderWidth: 2,
        pointHoverBackgroundColor: '#3CB371',
        spanGaps: true
      }
      ]
    }))

  }


  onOpenDialogSearchProduct() {
    const dialogRef = this.dialog.open(SearchProductDialog, {
      disableClose: true,
      data: {selectedProduct : this.productDetail()}
    });
  }


}





