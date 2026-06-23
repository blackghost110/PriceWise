import { Component, ChangeDetectionStrategy } from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import {MatButton, MatFabButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {AppNode} from '@shared/route/node.enum';
import {AppRoutes} from '@shared/route/app-routes.enum';

@Component({
  selector: 'app-home',
  imports: [
    Header,
    Footer,
    MatButton,
    MatFabButton,
    RouterLink
  ],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './home.css'
})
export class Home {

  protected readonly AppNode = AppNode;
  readonly AppRoutes = AppRoutes;
}
