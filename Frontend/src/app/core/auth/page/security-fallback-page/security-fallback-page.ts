import { Component } from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';

@Component({
  selector: 'app-security-fallback-page',
  imports: [
    Header,
    Footer
  ],
  templateUrl: './security-fallback-page.html',
  styleUrl: './security-fallback-page.css'
})
export class SecurityFallbackPage {

}
