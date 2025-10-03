import {Component, inject, OnInit, signal} from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import { NgStyle} from '@angular/common';
import { MatIconButton} from '@angular/material/button';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {AppRoutes} from '@shared/route/app-routes.enum';
import {RouterLink} from '@angular/router';
import {AdminService} from '@features/admin/admin.service';
import {UserDto} from '@core/auth/data/dto/user.dto';
import {MatDialog} from '@angular/material/dialog';
import {UpdateUserDialog} from '@features/admin/component/dialog/update-user-dialog/update-user-dialog';

@Component({
  selector: 'app-admin-dashboard-page',
  imports: [
    Header,
    Footer,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatIcon,
    MatIconButton,
    MatMenu,
    MatMenuItem,
    MatRow,
    MatRowDef,
    MatTable,
    MatHeaderCellDef,
    MatMenuTrigger,
    RouterLink,
    NgStyle
  ],
  templateUrl: './admin-dashboard-page.html',
  styleUrl: './admin-dashboard-page.css'
})
export class AdminDashboardPage implements OnInit{

  private dialog = inject(MatDialog);
  private adminService = inject(AdminService)
  readonly AppRoutes = AppRoutes;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  userList = this.adminService.userList

  displayedColumns: string[] = ['username', 'role', 'actions'];

    ngOnInit() {
    this.adminService.getUsers().subscribe()
    }



  onOpenDialogUpdateRole(user: UserDto) {
    const dialogRef = this.dialog.open(UpdateUserDialog, {
      data: {user: user}
    });
  }

}
