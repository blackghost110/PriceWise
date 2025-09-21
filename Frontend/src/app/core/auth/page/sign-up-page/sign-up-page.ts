import {Component, DestroyRef, inject, signal} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '@core/auth/auth.service';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {finalize, tap} from 'rxjs';
import {MatButton} from '@angular/material/button';
import {ApiResponse} from '@shared/api/data/api.response';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {SignUpPayload} from '@core/auth/data/payload/sign-up.payload';
import {AppNode} from '@shared/route/node.enum';

@Component({
  selector: 'app-sign-up-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButton
  ],
  templateUrl: './sign-up-page.html',
  styleUrl: './sign-up-page.css'
})
export class SignUpPage {

  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  private errorMessageService = inject(ErrorMessageService)

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);



  form = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required]
    }),
    username: new FormControl('', {
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
  get isEnteredUsernameValid() {
    return this.form.controls.username.touched &&
      this.form.controls.username.dirty &&
      this.form.controls.username.invalid
  }
  get isPasswordMismatch() {
    const password = this.form.get('password')?.value;
    const repeatPassword = this.form.get('repeatPassword')?.value;

    return this.form.get('repeatPassword')?.touched &&
      password !== repeatPassword &&
      password && repeatPassword;
  }

  onRegister() {

      if (this.form.invalid || this.isPasswordMismatch) {
        this.form.markAllAsTouched();
        return;
      }
      this.errorMessage.set(null);
      this.isLoading.set(true);

    const formValue = this.form.value;
    const payload: SignUpPayload = {
      username: formValue.username!,
      password: formValue.password!,
      mail: formValue.email!
    }

      this.authService.register(payload).pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((apiResponse: ApiResponse) => {
          if (!apiResponse.result) {
            console.log('apiResponse details : ', apiResponse)
            this.errorMessage.set(this.errorMessageService.getErrorMessage(apiResponse.code))
          }
        }),
        finalize(() => this.isLoading.set(false))
      ).subscribe({
        error: (error: Error) => {
          console.error('Login error:', error);
          this.errorMessage.set(error.message);
        }
      })
  }

  protected readonly AppNode = AppNode;
}
