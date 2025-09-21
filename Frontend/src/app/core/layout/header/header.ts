import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '@core/auth/auth.service';
import {MatIcon, MatIconModule} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatButton} from '@angular/material/button';
import {AppNode} from '@shared/route/node.enum';

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
  styleUrl: './header.css'
})
export class Header implements OnInit {

  router = inject(Router)
  authService = inject(AuthService)

  currentUser = this.authService.currentUser;

  ngOnInit(){
    this.authService.me()
  }


  onLogout() {
    this.authService.logOut()
  }

  protected readonly AppNode = AppNode;
}
