import { Component, ChangeDetectionStrategy } from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';

@Component({
  selector: 'app-social-fallback-page',
  imports: [
    Header,
    Footer
  ],
  templateUrl: './social-fallback-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './social-fallback-page.css'
})
export class SocialFallbackPage {

}
