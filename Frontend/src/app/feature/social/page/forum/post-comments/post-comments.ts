import {Component, inject, input, OnInit, signal} from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import {MatFormField} from '@angular/material/form-field';
import {MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {CommentService} from '@features/social/service/comment.service';
import {DatePipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {CreateCommentPayload} from '@features/social/data/payload/create-comment.payload';
import {PostService} from '@features/social/service/post.service';
import {tap} from 'rxjs';
import {ApiResponse} from '@shared/api/data/api.response';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {AppNode} from '@shared/route/node.enum';
import {AppRoutes} from '@shared/route/app-routes.enum';

@Component({
  selector: 'app-post-comments',
  imports: [
    Header,
    Footer,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    FormsModule,
    DatePipe,
    MatIcon,
    RouterLink
  ],
  templateUrl: './post-comments.html',
  styleUrl: './post-comments.css'
})
export class PostComments implements OnInit {

  commentService = inject(CommentService)
  postService = inject(PostService);
  private errorMessageService = inject(ErrorMessageService)

  // dynamic url
  postId = input.required<string>()

  isExpanded = false;
  commentText = signal('');
  errorMessage = signal<string | null>(null);

  commentList = this.commentService.commentList;
  postInfo = this.postService.postInfo;
  readonly AppRoutes = AppRoutes;


  ngOnInit() {
    this.commentService.getComments(+this.postId()).subscribe()
    this.postService.getPost(+this.postId()).subscribe()
  }

  onAddComment() {
      const text = this.commentText().trim();

      if (!text) {
        return;
      }

      const payload: CreateCommentPayload = {
        message: text,
      };

      this.commentService.addComment(payload, +this.postId()).pipe(
        tap((apiResponse: ApiResponse) => {
          if (!apiResponse.result) {
            this.errorMessage.set(this.errorMessageService.getErrorMessage(apiResponse.code))
          }
        })
      )
        .subscribe({
        next: () => {
          this.commentText.set('');
          this.isExpanded = false;
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du commentaire:', error);
        }
      });

  }

  protected readonly AppNode = AppNode;
}
