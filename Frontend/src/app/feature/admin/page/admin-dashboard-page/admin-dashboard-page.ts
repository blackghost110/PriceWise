import {Component, inject, OnInit, signal, ChangeDetectionStrategy} from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import {MatIconButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {AdminService} from '@features/admin/admin.service';
import {UserDto} from '@core/auth/data/dto/user.dto';
import {MatDialog} from '@angular/material/dialog';
import {UpdateUserDialog} from '@features/admin/component/dialog/update-user-dialog/update-user-dialog';
import {AdminNav} from '@features/admin/component/admin-nav/admin-nav';
import {avatarGradient, initials} from '@shared/util/avatar.util';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [
    Header,
    Footer,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    AdminNav,
  ],
  templateUrl: './admin-dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './admin-dashboard-page.css'
})
export class AdminDashboardPage implements OnInit{

  private dialog = inject(MatDialog);
  private adminService = inject(AdminService)

  protected readonly initials = initials;
  protected readonly avatarGradient = avatarGradient;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  userList = this.adminService.userList

  ngOnInit() {
    this.adminService.getUsers().subscribe()
  }

  onOpenDialogUpdateRole(user: UserDto) {
    const dialogRef = this.dialog.open(UpdateUserDialog, {
      data: {user: user}
    });
  }

}
