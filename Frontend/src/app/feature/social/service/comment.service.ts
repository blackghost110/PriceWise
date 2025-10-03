import {inject, Injectable, signal} from '@angular/core';
import {ApiService} from '@shared/api/service/api.service';
import {catchError, tap, throwError} from 'rxjs';
import {ApiResponse} from '@shared/api/data/api.response';
import {CreateCommentPayload} from '@features/social/data/payload/create-comment.payload';
import {CommentDto} from '@features/social/data/dto/comment.dto';
import {ApiURI} from '@shared/api/api-uri.enum';
import {SnackbarService} from '@shared/service/snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class CommentService {

  private readonly api = inject(ApiService)
  private snackbar = inject(SnackbarService)


  private _commentList = signal<CommentDto[] | null>(null)
  commentList = this._commentList.asReadonly()



  addComment(payload: CreateCommentPayload, postId: number) {
    return this.api.post(`${ApiURI.COMMENT_CREATE}/${postId}`, payload).pipe(
      tap((response:ApiResponse) => {
        console.log(response)
        if (response.result) {
          this.getComments(postId).subscribe()
          this.snackbar.show('Commentaire ajouté avec succès')
        }
      })
    );
  }

  getComments(postId: number) {
    return this.api.get(`${ApiURI.COMMENT_GET_ALL}/${postId}`)
      .pipe(
        tap((response: ApiResponse) => {
          this._commentList.set(response.data);
          console.log(response)
        }),
        catchError(error => {
          return throwError(() => new Error(error));
        })
      )
  }



}
