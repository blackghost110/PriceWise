import { Component } from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';

@Component({
  selector: 'app-catalog-fallback-page',
  imports: [
    Header,
    Footer
  ],
  templateUrl: './catalog-fallback-page.html',
  styleUrl: './catalog-fallback-page.css'
})
export class CatalogFallbackPage {

}
