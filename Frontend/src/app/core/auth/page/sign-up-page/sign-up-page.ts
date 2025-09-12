import { Component } from '@angular/core';

@Component({
  selector: 'app-sign-up-page',
  imports: [],
  templateUrl: './sign-up-page.html',
  styleUrl: './sign-up-page.css'
})
export class SignUpPage {

  // private authService = inject(AuthService);
  // private router = inject(Router);
  // private destroyRef = inject(DestroyRef);
  //
  // errorMessage = signal<string | null>(null);
  // isLoading = signal(false);
  //
  //
  //
  // form = new FormGroup({
  //   email: new FormControl('', {
  //     validators: [Validators.email, Validators.required]
  //   }),
  //   username: new FormControl('', {
  //     validators: [Validators.required, Validators.minLength(3)]
  //   }),
  //   password: new FormControl('', {
  //     validators: [Validators.required, Validators.minLength(6)]
  //   })
  // });
  //
  // get isEnteredEmailValid() {
  //   return this.form.controls.email.touched &&
  //     this.form.controls.email.dirty &&
  //     this.form.controls.email.invalid
  // }
  // get isEnteredPasswordValid() {
  //   return this.form.controls.password.touched &&
  //     this.form.controls.password.dirty &&
  //     this.form.controls.password.invalid
  // }
  // get isEnteredUsernameValid() {
  //   return this.form.controls.username.touched &&
  //     this.form.controls.username.dirty &&
  //     this.form.controls.username.invalid
  // }
  //
  // onRegister() {
  //
  //     if (this.form.invalid) {
  //       this.form.markAllAsTouched();
  //       return;
  //     }
  //
  //     this.errorMessage.set(null);
  //     this.isLoading.set(true);
  //
  //     this.authService.register(this.form.value as any).pipe(
  //       takeUntilDestroyed(this.destroyRef),
  //       finalize(() => this.isLoading.set(false))
  //     ).subscribe({
  //       next: (response) => {
  //         console.log('register success :', response)
  //         this.router.navigate(['/store-list'])
  //       },
  //       error: (error: Error) => {
  //         console.error('register error:', error);
  //         this.errorMessage.set(error.message);
  //       }
  //     })
  // }

}
