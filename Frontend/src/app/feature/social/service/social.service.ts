import {inject, Injectable, signal} from '@angular/core';
import {ApiService} from '@shared/api/service/api.service';
import {ApiURI} from '@shared/api/api-uri.enum';
import { tap} from 'rxjs';
import {ApiResponse} from '@shared/api/data/api.response';
import {UserCountDto} from '@features/social/data/dto/user-count.dto';

@Injectable({
  providedIn: 'root'
})
export class SocialService {

  private readonly api = inject(ApiService)

  private _userList = signal<UserCountDto[] | null>(null)
  userList = this._userList.asReadonly()


  getUsers() {
    return this.api.get(ApiURI.PRICE_GET_USER_COUNT)
      .pipe(
        tap((response: ApiResponse) => {
          this._userList.set(response.data);
          console.log(response)
        })
      )
  }
}
