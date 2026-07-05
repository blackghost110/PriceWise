import {inject, Injectable} from '@angular/core';
import {tap} from 'rxjs';
import {ApiService} from '@shared/api/service/api.service';
import {ApiURI} from '@shared/api/api-uri.enum';
import {SnackbarService} from '@shared/service/snackbar.service';
import {UpdateDisplayNamePayload} from '@features/account/data/payload/update-display-name.payload';
import {SetActiveBadgePayload} from '@features/account/data/payload/set-active-badge.payload';
import {UserDto} from '@core/auth/data/dto/user.dto';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private readonly api = inject(ApiService);
  private readonly snackbar = inject(SnackbarService);

  checkDisplayNameAvailable(displayName: string) {
    return this.api.get<{ available: boolean }>(`${ApiURI.ACCOUNT_DISPLAY_NAME_AVAILABLE}?value=${encodeURIComponent(displayName)}`);
  }

  updateDisplayName(payload: UpdateDisplayNamePayload) {
    return this.api.put<UserDto>(ApiURI.ACCOUNT_DISPLAY_NAME_UPDATE, payload).pipe(
      tap(() => this.snackbar.show('Nom d\'affichage modifié avec succès'))
    );
  }

  setActiveBadge(payload: SetActiveBadgePayload) {
    return this.api.put<UserDto>(ApiURI.BADGE_SET_ACTIVE, payload).pipe(
      tap(() => this.snackbar.show('Badge actif mis à jour'))
    );
  }
}
