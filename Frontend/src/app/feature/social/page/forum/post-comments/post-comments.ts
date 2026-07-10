import {ChangeDetectionStrategy, Component, inject, input, OnInit, signal} from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import {ForumNav} from '@features/social/component/forum-nav/forum-nav';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {CommentService} from '@features/social/service/comment.service';
import {DatePipe} from '@angular/common';
import {MatIcon} from '@angular/material/icon';
import {RouterLink} from '@angular/router';
import {CreateCommentPayload} from '@features/social/data/payload/create-comment.payload';
import {PostService} from '@features/social/service/post.service';
import {catchError, EMPTY} from 'rxjs';
import {ErrorMessageService} from '@shared/api/service/error-message.service';
import {HttpErrorResponse} from '@angular/common/http';
import {AppRoutes} from '@shared/route/app-routes.enum';
import {RelativeTimePipe} from '@shared/pipe/relative-time.pipe';
import {avatarGradient, initials} from '@shared/util/avatar.util';
import {ReportButton} from '@shared/component/report-button/report-button';
import {ReportTargetType} from '@features/report/data/dto/report.dto';

@Component({
  selector: 'app-post-comments',
  imports: [
    Header,
    Footer,
    ForumNav,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    FormsModule,
    DatePipe,
    MatIcon,
    RouterLink,
    RelativeTimePipe,
    ReportButton,
  ],
  templateUrl: './post-comments.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './post-comments.css'
})
export class PostComments implements OnInit {

  private readonly commentService = inject(CommentService);
  private readonly postService = inject(PostService);
  private readonly errorMessageService = inject(ErrorMessageService);

  // dynamic url
  postId = input.required<string>();

  isExpanded = false;
  commentText = signal('');
  errorMessage = signal<string | null>(null);

  commentList = this.commentService.commentList;
  postInfo = this.postService.postInfo;
  readonly AppRoutes = AppRoutes;
  protected readonly initials = initials;
  protected readonly avatarGradient = avatarGradient;
  protected readonly ReportTargetType = ReportTargetType;

  ngOnInit() {
    this.commentService.getComments(+this.postId()).subscribe();
    this.postService.getPost(+this.postId()).subscribe();
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
      catchError((err: HttpErrorResponse) => {
        this.errorMessage.set(this.errorMessageService.getErrorMessage(err.error?.code, err.error?.data))
        return EMPTY;
      })
    )
      .subscribe(() => {
        this.commentText.set('');
        this.isExpanded = false;
      });
  }
}
