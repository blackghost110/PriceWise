import {ApiService} from '@shared/api/service/api.service';
import {computed, inject, Injectable, signal} from '@angular/core';
import {Router} from '@angular/router';
import {firstValueFrom} from 'rxjs';
import {ApiURI} from '@shared/api/api-uri.enum';
import {AppNode} from '@shared/route/node.enum';
import {AppRoutes} from '@shared/route/app-routes.enum';
import {UserDto} from '@core/auth/data/dto/user.dto';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly api = inject(ApiService);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  currentUser = signal<UserDto | null>(null);
  isAdmin = computed(() => this.currentUser()?.role === 'ADMIN');

  private initialCheckCompleted = false;
  private resolveInitialCheck!: () => void;
  private readonly initialCheckDone: Promise<void> = new Promise((resolve) => {
    this.resolveInitialCheck = resolve;
  });

  // Login/register call refreshCurrentUser() themselves once the Firebase user
  // (and its displayName, for registration) is fully settled. Without this flag,
  // the authState event fired by sign-in/sign-up would race its own call to
  // /account/me against ours, sometimes hitting the backend before updateProfile
  // completes and permanently provisioning the Credential with the wrong displayName.
  private skipNextAuthStateRefresh = false;

  constructor() {
    authState(this.auth).subscribe(async (firebaseUser) => {
      if (this.skipNextAuthStateRefresh) {
        this.skipNextAuthStateRefresh = false;
      } else if (firebaseUser) {
        await this.refreshCurrentUser();
      } else {
        this.currentUser.set(null);
      }
      if (!this.initialCheckCompleted) {
        this.initialCheckCompleted = true;
        this.resolveInitialCheck();
      }
    });
  }

  public async loginWithGoogle(): Promise<void> {
    await this.withSuppressedAutoRefresh(() => signInWithPopup(this.auth, new GoogleAuthProvider()));
    await this.refreshCurrentUser();
    this.router.navigate([AppNode.HOME]);
  }

  public async loginWithEmail(email: string, password: string): Promise<void> {
    await this.withSuppressedAutoRefresh(() => signInWithEmailAndPassword(this.auth, email, password));
    await this.refreshCurrentUser();
    this.router.navigate([AppNode.HOME]);
  }

  public async registerWithEmail(email: string, password: string, displayName: string): Promise<void> {
    const credential = await this.withSuppressedAutoRefresh(() =>
      createUserWithEmailAndPassword(this.auth, email, password));
    await updateProfile(credential.user, {displayName});
    // Force a refresh: the ID token minted at creation predates updateProfile,
    // so its "name" claim is still empty unless we re-fetch it.
    await credential.user.getIdToken(true);
    await this.refreshCurrentUser();
    this.router.navigate([AppRoutes.SIGN_IN_PAGE]);
  }

  private async withSuppressedAutoRefresh<T>(action: () => Promise<T>): Promise<T> {
    this.skipNextAuthStateRefresh = true;
    try {
      return await action();
    } catch (e) {
      this.skipNextAuthStateRefresh = false;
      throw e;
    }
  }

  public async logOut(): Promise<void> {
    await signOut(this.auth);
    this.currentUser.set(null);
    this.router.navigate([AppRoutes.SIGN_IN_PAGE]);
  }

  async checkUser(): Promise<boolean> {
    if (this.currentUser()) {
      return true;
    }
    if (!this.initialCheckCompleted) {
      await this.initialCheckDone;
    }
    return !!this.currentUser();
  }

  private async refreshCurrentUser(): Promise<void> {
    try {
      const user = await firstValueFrom(this.api.get<UserDto>(ApiURI.ME));
      this.currentUser.set(user);
    } catch (error) {
      console.error('Erreur récupération utilisateur:', error);
      this.currentUser.set(null);
    }
  }

}
