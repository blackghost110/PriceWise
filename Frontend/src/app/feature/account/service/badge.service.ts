import {inject, Injectable, signal} from '@angular/core';
import {tap} from 'rxjs';
import {ApiService} from '@shared/api/service/api.service';
import {ApiURI} from '@shared/api/api-uri.enum';
import {BadgeOverviewDto} from '@features/account/data/dto/badge-overview.dto';
import {ProfileGamificationDto} from '@features/account/data/dto/profile-gamification.dto';

@Injectable({
  providedIn: 'root'
})
export class BadgeService {

  private readonly api = inject(ApiService);

  private _overview = signal<BadgeOverviewDto | null>(null);
  overview = this._overview.asReadonly();

  private _profileStats = signal<ProfileGamificationDto | null>(null);
  profileStats = this._profileStats.asReadonly();

  getOverview() {
    return this.api.get<BadgeOverviewDto>(ApiURI.BADGE_OVERVIEW).pipe(
      tap((overview) => this._overview.set(overview))
    );
  }

  getProfileGamification() {
    return this.api.get<ProfileGamificationDto>(ApiURI.GAMIFICATION_PROFILE).pipe(
      tap((stats) => this._profileStats.set(stats))
    );
  }
}
