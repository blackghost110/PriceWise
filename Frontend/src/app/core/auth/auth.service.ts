import {ApiService} from '@shared/api/service/api.service';
import {computed, inject, Injectable, OnInit, signal} from '@angular/core';
import {TokenService} from '@shared/api/service/token.service';
import {Router} from '@angular/router';
import {SignInPayload} from './data/payload/sign-in.payload';
import {catchError, firstValueFrom, Observable, tap, throwError} from 'rxjs';
import {ApiResponse} from '@shared/api/data/api.response';
import {SignUpPayload} from './data/payload/sign-up.payload';
import {ApiURI} from '@shared/api/api-uri.enum';
import {AppNode} from '@shared/route/node.enum';
import {HttpErrorResponse} from '@angular/common/http';
import { AppRoutes } from "@app/shared/route/app-routes.enum";
import {UserDto} from '@core/auth/data/dto/user.dto';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit {


  private readonly api = inject(ApiService);
  private readonly tokenService = inject(TokenService);
  private readonly router = inject(Router);

  currentUser = signal<UserDto | null>(null);
  isAdmin = computed(() => this.currentUser()?.isAdmin ?? false);
  // isAuthenticated = computed(() => !!this.currentUser());

  ngOnInit() {
    console.log('authService init')
    this.me()
  }

  constructor() {

  }

  public login(payload: SignInPayload): Observable<ApiResponse> {
    return this.api.post(ApiURI.SIGN_IN, {...payload, }).pipe(
      tap((response: ApiResponse) => {
        if (response.result) {
          this.tokenService.setToken({...response.data, isEmpty: false});
          this.router.navigate([AppNode.HOME]);
          console.log('login success')
        }
      }),
      catchError(this.getErrorHandler)
    );
  }

  public register(payload: SignUpPayload): Observable<ApiResponse> {
    return this.api.post(ApiURI.SIGN_UP, {...payload, socialLogin: false}).pipe(
      tap((response: ApiResponse) => {
        if (response.result) {
          this.router.navigate([AppRoutes.SIGN_IN_PAGE]);
          console.log('register success')
        }
      })
    );
  }

  public logOut(): void {
    this.tokenService.setToken({token: '', refreshToken: '', isEmpty: true});
    this.currentUser.set(null);
    this.router.navigate([AppRoutes.SIGN_IN_PAGE]);
  }

  public me() {
    this.api.get(ApiURI.ME).pipe(
      tap((response: ApiResponse) => {
        if (response.result) {
          this.currentUser.set(response.data);
        }
      })).subscribe();
  }

  async checkUser(): Promise<boolean> {
    if (this.currentUser()) {
      return true;
    }
    if (this.tokenService.token().isEmpty) {
      return false;
    }
    try {
      const response = await firstValueFrom(this.api.get(ApiURI.ME));
      if (response.result && response.data) {
        this.currentUser.set(response.data);
        return true;
      }
    } catch (error) {
      console.error('Erreur vérification auth:', error);
    }
    return false;
  }



  getErrorHandler(errorRes: HttpErrorResponse) {
    console.log('Login error details :', errorRes);

    let errorMessage = 'Une erreur est survenue';

    if (!errorRes.error) {
      return throwError(() => new Error(errorMessage));
    }

    switch (errorRes.status) {
      case 400:
        errorMessage = 'Identifiants invalides';
        break;
      case 401:
        errorMessage = 'Authentification requise';
        break;
    }
    if (errorRes.status >= 500) {
      errorMessage = 'Erreur serveur, veuillez réessayer plus tard';
    }

    switch (errorRes.error.message) {
      case 'Invalid credentials':
        errorMessage = 'Identifiants incorrects';
        break;
      case 'Password incorrect':
        errorMessage = 'Mot de passe incorrect';
        break;
      case 'Email already exists':
        errorMessage = 'Ce mail existe deja';
        break;
      case 'Username already exists':
        errorMessage = 'Ce nom d\'utilisateur existe deja';
        break;
    }
    return throwError(() => new Error(errorMessage));
  }


}
