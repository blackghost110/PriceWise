import {Component, ChangeDetectionStrategy, inject, signal} from '@angular/core';
import { RouterLink} from '@angular/router';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../auth.service';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {MatButton} from '@angular/material/button';
import {AppNode} from '@shared/route/node.enum';
import {AppRoutes} from '@shared/route/app-routes.enum';

@Component({
  selector: 'app-sign-in-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButton
  ],
  templateUrl: './sign-in-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sign-in-page.css'
})
export class SignInPage {

  private authService = inject(AuthService);
  private errorMessageService = inject(ErrorMessageService)
  readonly AppRoutes = AppRoutes;

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.required, Validators.email]
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  get isEnteredEmailValid() {
    return this.form.controls.email.touched &&
      this.form.controls.email.dirty &&
      this.form.controls.email.invalid
  }
  get isEnteredPasswordValid() {
    return this.form.controls.password.touched &&
      this.form.controls.password.dirty &&
      this.form.controls.password.invalid
  }

  async onLogin() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    try {
      await this.authService.loginWithEmail(this.form.value.email!, this.form.value.password!);
    } catch (err: any) {
      this.errorMessage.set(this.errorMessageService.getErrorMessage(err.code));
    } finally {
      this.isLoading.set(false);
    }
  }

  async onLoginWithGoogle() {
    this.errorMessage.set(null);
    this.isLoading.set(true);

    try {
      await this.authService.loginWithGoogle();
    } catch (err: any) {
      this.errorMessage.set(this.errorMessageService.getErrorMessage(err.code));
    } finally {
      this.isLoading.set(false);
    }
  }

  protected readonly AppNode = AppNode;
}
