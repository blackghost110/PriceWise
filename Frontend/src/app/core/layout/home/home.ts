import { Component } from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import {MatButton, MatFabButton} from '@angular/material/button';
import {RouterLink} from '@angular/router';
import {AppNode} from '@shared/route/node.enum';

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
  styleUrl: './home.css'
})
export class Home {

  protected readonly AppNode = AppNode;
}
