import {Component, DestroyRef, inject, OnInit, signal} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {debounceTime, finalize, tap} from 'rxjs';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../auth.service';
import {ApiResponse} from '@shared/api/data/api.response';
import {ErrorMessageService} from '@shared/api/service/error-message.service';

@Component({
  selector: 'app-sign-in-page',
  imports: [
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './sign-in-page.html',
  styleUrl: './sign-in-page.css'
})
export class SignInPage implements OnInit {

  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private errorMessageService = inject(ErrorMessageService)

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);



  ngOnInit(): void {
    const savedForm = window.localStorage.getItem('save-login-form');
    if (savedForm) {
      const loadedForm = JSON.parse(savedForm)
      this.form.patchValue({
        username: loadedForm.username
      })

    }


    this.form.valueChanges.pipe(
      debounceTime(500),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
        next: (value) => {
          window.localStorage.setItem('save-login-form', JSON.stringify({username: value.username}));

          if (this.errorMessage()) {
            this.errorMessage.set(null);
          }
        },
      }
    );
  }

  form = new FormGroup({
    username: new FormControl('', {
      validators: [Validators.required]
    }),
    password: new FormControl('', {
      validators: [Validators.required, Validators.minLength(6)]
    })
  });

  get isEnteredUsernameValid() {
    return this.form.controls.username.touched &&
      this.form.controls.username.dirty &&
      this.form.controls.username.invalid
  }
  get isEnteredPasswordValid() {
    return this.form.controls.password.touched &&
      this.form.controls.password.dirty &&
      this.form.controls.password.invalid
  }

  onLogin() {

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.errorMessage.set(null);
    this.isLoading.set(true);

    this.authService.login(this.form.value as any).pipe(
      takeUntilDestroyed(this.destroyRef),
      tap((apiResponse: ApiResponse) => {
        if (!apiResponse.result) {
          console.log('apiResponse details : ', apiResponse)
          const userFriendlyMessage = this.errorMessageService.getErrorMessage(apiResponse.code)
          this.errorMessage.set(userFriendlyMessage)
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

}
