import {Component, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {Footer} from '@core/layout/footer/footer';
import {Header} from '@core/layout/header/header';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell, MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow, MatRowDef, MatTable
} from '@angular/material/table';
import {SocialService} from '@features/social/service/social.service';
import {AppRoutes} from '@shared/route/app-routes.enum';
import {MatIcon} from '@angular/material/icon';
import {RouterLink, RouterLinkActive} from '@angular/router';

@Component({
  selector: 'app-leaderboard',
  imports: [
    Footer,
    Header,
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    MatHeaderCellDef,
    MatIcon,
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './leaderboard.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './leaderboard.css'
})
export class Leaderboard {

  private socialService = inject(SocialService)
  readonly AppRoutes = AppRoutes;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  userList = this.socialService.userList;

  displayedColumns: string[] = ['displayName', 'score'];

  ngOnInit() {
    this.socialService.getUsers().subscribe()
  }



}
