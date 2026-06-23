import {inject, Injectable, signal} from '@angular/core';
import {ApiService} from '@shared/api/service/api.service';
import {tap} from 'rxjs';
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
      tap(() => {
        this.getPosts().subscribe()
        this.snackbar.show('Discussion ajoutée avec succès')
      })
    );
  }

  getPosts() {
    return this.api.get<PostDto[]>(`${ApiURI.POST_GET_ALL}`)
      .pipe(
        tap((posts) => this._postList.set(posts))
      )
  }

  getPost(postId: number) {
    return this.api.get<PostDto>(`${ApiURI.POST_GET}/${postId}`)
      .pipe(
        tap((post) => this._postInfo.set(post))
      )
  }


}
