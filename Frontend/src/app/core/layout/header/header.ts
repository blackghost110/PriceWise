import {Component, inject, ChangeDetectionStrategy} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '@core/auth/auth.service';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatButton} from '@angular/material/button';
import {AppNode} from '@shared/route/node.enum';
import {AppRoutes} from '@shared/route/app-routes.enum';

@Component({
  selector: 'app-header',
  imports: [
    RouterLink,
    MatIcon,
    MatMenuTrigger,
    MatMenuItem,
    MatMenu,
    MatButton,
    MatIconModule
  ],
  templateUrl: './header.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './header.css'
})
export class Header {

  router = inject(Router)
  authService = inject(AuthService)

  // currentUser is populated reactively by AuthService (Firebase auth state), no manual fetch needed here
  currentUser = this.authService.currentUser;
  isAdmin = this.authService.isAdmin;

  onLogout() {
    this.authService.logOut()
  }


  protected readonly AppNode = AppNode;
  readonly AppRoutes = AppRoutes;
}
