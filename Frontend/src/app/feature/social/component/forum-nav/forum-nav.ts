import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {AppRoutes} from '@shared/route/app-routes.enum';

@Component({
  selector: 'app-forum-nav',
  imports: [
    RouterLink,
    RouterLinkActive,
    MatIcon,
  ],
  templateUrl: './forum-nav.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './forum-nav.css'
})
export class ForumNav {
  readonly AppRoutes = AppRoutes;
}
