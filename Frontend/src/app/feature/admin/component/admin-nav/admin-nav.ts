import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {AppRoutes} from '@shared/route/app-routes.enum';

@Component({
  selector: 'app-admin-nav',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIcon,
  ],
  templateUrl: './admin-nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './admin-nav.css'
})
export class AdminNav {
  readonly AppRoutes = AppRoutes;
}
