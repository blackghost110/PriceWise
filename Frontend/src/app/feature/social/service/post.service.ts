import {inject, Injectable, signal} from '@angular/core';
import {ApiService} from '@shared/api/service/api.service';
import {catchError, tap, throwError} from 'rxjs';
import {ApiResponse} from '@shared/api/data/api.response';
import {PostDto} from '@features/social/data/dto/post.dto';
import {CreatePostPayload} from '@features/social/data/payload/create-post.payload';
import {ApiURI} from '@shared/api/api-uri.enum';
import {SnackbarService} from '@shared/service/snackbar.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  private readonly api = inject(ApiService)
  private snackbar = inject(SnackbarService)


  private _postList = signal<PostDto[] | null>(null)
  postList = this._postList.asReadonly()

  private _postInfo = signal<PostDto | null>(null)
  postInfo = this._postInfo.asReadonly()




  addPost(payload: CreatePostPayload) {
    return this.api.post(`${ApiURI.POST_CREATE}`, payload).pipe(
      tap((response:ApiResponse) => {
        console.log(response)
        if (response.result) {
          this.getPosts().subscribe()
          this.snackbar.show('Discussion ajoutée avec succès')
        }
      })
    );
  }

  getPosts() {
    return this.api.get(`${ApiURI.POST_GET_ALL}`)
      .pipe(
        tap((response: ApiResponse) => {
          this._postList.set(response.data);
          console.log(response)
        }),
        catchError(error => {
          return throwError(() => new Error(error));
        })
      )
  }

  getPost(postId: number) {
    return this.api.get(`${ApiURI.POST_GET}/${postId}`)
      .pipe(
        tap((response: ApiResponse) => {
          this._postInfo.set(response.data);
          console.log(response)
        }),
        catchError(error => {
          return throwError(() => new Error(error));
        })
      )
  }


}
