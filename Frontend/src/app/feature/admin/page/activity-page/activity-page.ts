import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import {AdminNav} from '@features/admin/component/admin-nav/admin-nav';
import {AdminService} from '@features/admin/admin.service';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {FormsModule} from '@angular/forms';
import {DatePipe} from '@angular/common';
import {RelativeTimePipe} from '@shared/pipe/relative-time.pipe';
import {avatarGradient, initials} from '@shared/util/avatar.util';
import {ActionType, actionTypeLabel, EntityType, entityTypeLabel} from '@features/admin/data/dto/activity-log.dto';

@Component({
  selector: 'app-activity-page',
  imports: [
    Header,
    Footer,
    AdminNav,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    FormsModule,
    DatePipe,
    RelativeTimePipe,
  ],
  templateUrl: './activity-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './activity-page.css'
})
export class ActivityPage implements OnInit {

  private readonly adminService = inject(AdminService);

  protected readonly initials = initials;
  protected readonly avatarGradient = avatarGradient;
  protected readonly actionTypeLabel = actionTypeLabel;
  protected readonly entityTypeLabel = entityTypeLabel;
  protected readonly EntityType = EntityType;
  protected readonly ActionType = ActionType;

  activityLogs = this.adminService.activityLogs;

  userFilter = signal('');
  entityTypeFilter = signal('');
  actionTypeFilter = signal('');

  ngOnInit() {
    this.adminService.getActivityLogs().subscribe();
  }

  /** Utilisateurs distincts présents dans le journal, pour peupler le filtre. */
  userOptions = computed(() => {
    const logs = this.activityLogs();
    if (!logs) return [];
    const names = new Set(logs.map(log => log.credential?.displayName).filter((n): n is string => !!n));
    return Array.from(names).sort();
  });

  filteredLogs = computed(() => {
    const logs = this.activityLogs();
    if (!logs) return null;

    const user = this.userFilter();
    const entityType = this.entityTypeFilter();
    const actionType = this.actionTypeFilter();

    return logs.filter(log =>
      (!user || log.credential?.displayName === user) &&
      (!entityType || log.entityType === entityType) &&
      (!actionType || log.actionType === actionType)
    );
  });

  onClearFilters() {
    this.userFilter.set('');
    this.entityTypeFilter.set('');
    this.actionTypeFilter.set('');
  }
}
