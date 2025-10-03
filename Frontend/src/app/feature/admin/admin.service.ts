import {inject, Injectable, signal} from '@angular/core';
import {ApiService} from '@shared/api/service/api.service';
import {ApiURI} from '@shared/api/api-uri.enum';
import {tap} from 'rxjs';
import {ApiResponse} from '@shared/api/data/api.response';
import {UserDto} from '@core/auth/data/dto/user.dto';
import {UpdateUserPayload} from '@features/admin/data/payload/update-user.payload';
import {SnackbarService} from '@shared/service/snackbar.service';

@Injectable({ providedIn: 'root' })
export class AdminService {

  private readonly api = inject(ApiService)
  private snackbar = inject(SnackbarService)


  private _userList = signal<UserDto[] | null>(null)
  userList = this._userList.asReadonly()

  getUsers() {
    return this.api.get(ApiURI.ACCOUNT_GET_ALL)
      .pipe(
        tap((response:ApiResponse) => {
          this._userList.set(response.data);
          console.log(response)
        })
      )
  }

  updateUser(payload: UpdateUserPayload, userId: number) {
    return this.api.put(`${ApiURI.ACCOUNT_UPDATE}/${userId}`, payload).pipe(
      tap((response:ApiResponse) => {
        console.log(response)
        if (response.result) {
          this.getUsers().subscribe()
          this.snackbar.show('Utilisateur modifié avec succès')
        }
      })
    );
  }

}
