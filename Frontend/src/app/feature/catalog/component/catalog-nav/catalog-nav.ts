import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {AppRoutes} from '@shared/route/app-routes.enum';

@Component({
  selector: 'app-catalog-nav',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIcon,
  ],
  templateUrl: './catalog-nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './catalog-nav.css'
})
export class CatalogNav {
  readonly AppRoutes = AppRoutes;
}
