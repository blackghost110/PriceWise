import {Component, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { RouterLink} from '@angular/router';
import {AuthService} from '@core/auth/auth.service';
import {MatButton} from '@angular/material/button';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {AppNode} from '@shared/route/node.enum';
import {AppRoutes} from '@shared/route/app-routes.enum';

@Component({
  selector: 'app-sign-up-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButton
  ],
  templateUrl: './sign-up-page.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './sign-up-page.css'
})
export class SignUpPage {

  private authService = inject(AuthService);
  private errorMessageService = inject(ErrorMessageService)
  readonly AppRoutes = AppRoutes;

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);



  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required]
    }),
    displayName: new FormControl('', {
      validators: [Validators.required, Validators.minLength(3)]
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)]
    }),
    repeatPassword: new FormControl('', {
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
  get isEnteredDisplayNameValid() {
    return this.form.controls.displayName.touched &&
      this.form.controls.displayName.dirty &&
      this.form.controls.displayName.invalid
  }
  get isPasswordMismatch() {
    const password = this.form.get('password')?.value;
    const repeatPassword = this.form.get('repeatPassword')?.value;

    return this.form.get('repeatPassword')?.touched &&
      password !== repeatPassword &&
      password && repeatPassword;
  }

  async onRegister() {

      if (this.form.invalid || this.isPasswordMismatch) {
        this.form.markAllAsTouched();
        return;
      }
      this.errorMessage.set(null);
      this.isLoading.set(true);

    const {email, displayName, password} = this.form.value;

    try {
      await this.authService.registerWithEmail(email!, password!, displayName!);
    } catch (err: any) {
      this.errorMessage.set(this.errorMessageService.getErrorMessage(err.code));
    } finally {
      this.isLoading.set(false);
    }
  }

  async onRegisterWithGoogle() {
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
