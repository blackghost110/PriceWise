import {Component, DestroyRef, inject, signal, ChangeDetectionStrategy} from '@angular/core';
import {MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle} from '@angular/material/dialog';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
import {MatButton} from '@angular/material/button';
import {MatFormField} from '@angular/material/form-field';
import {MatInput, MatLabel} from '@angular/material/input';
import {PostService} from '@features/social/service/post.service';
import {CreatePostPayload} from '@features/social/data/payload/create-post.payload';
import {RouterLink} from '@angular/router';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {catchError, EMPTY} from 'rxjs';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-add-post-dialog',
  imports: [
    FormsModule,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './add-post-dialog.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './add-post-dialog.css'
})
export class AddPostDialog {

  destroyRef = inject(DestroyRef);
  dialogRef = inject(MatDialogRef<AddPostDialog>);
  private errorMessageService = inject(ErrorMessageService)

  postService = inject(PostService);

  errorMessage = signal<string | null>(null);

  postForm = new FormGroup({
    title: new FormControl<string>('', {
      validators: [Validators.required]
    }),
    message: new FormControl<string>('', {
      validators: [Validators.required]
    }),
    postalCode: new FormControl<string>('', {
      validators: [Validators.required]
    }),
  })




  onAddPost() {
    console.log(this.postForm)
    if (this.postForm.invalid) {
      console.log('invalid form')
      return
    }
    this.errorMessage.set(null);

    const formValue = this.postForm.value;
    const payload: CreatePostPayload = {
      title: formValue.title!,
      message: formValue.message!,
      postalCode: formValue.postalCode!,
    }
    console.log('price payload :', payload)

    this.postService.addPost(payload).pipe(
      takeUntilDestroyed(this.destroyRef),
      catchError((err: HttpErrorResponse) => {
        this.errorMessage.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data))
        return EMPTY;
      })
    ).subscribe(() => this.dialogRef.close())
  }

  onClose() {
    this.dialogRef.close();
  }

}
