import {inject, Injectable, signal} from '@angular/core';
import {ApiService} from '@shared/api/service/api.service';
import {ApiURI} from '@shared/api/api-uri.enum';
import { tap} from 'rxjs';
import {UserCountDto} from '@features/social/data/dto/user-count.dto';
import {LeaderboardEntryDto, LeaderboardPeriod} from '@features/social/data/dto/leaderboard-entry.dto';

@Injectable({
  providedIn: 'root'
})
export class SocialService {

  private readonly api = inject(ApiService)

  private _userList = signal<UserCountDto[] | null>(null)
  userList = this._userList.asReadonly()

  private _leaderboard = signal<LeaderboardEntryDto[] | null>(null)
  leaderboard = this._leaderboard.asReadonly()


  getUsers() {
    return this.api.get<UserCountDto[]>(ApiURI.PRICE_GET_USER_COUNT)
      .pipe(
        tap((users) => this._userList.set(users))
      )
  }

  getLeaderboard(period: LeaderboardPeriod) {
    return this.api.get<LeaderboardEntryDto[]>(`${ApiURI.LEADERBOARD}?period=${period}`)
      .pipe(
        tap((entries) => this._leaderboard.set(entries))
      )
  }
}
