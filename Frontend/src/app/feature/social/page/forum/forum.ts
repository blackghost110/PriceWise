import {ChangeDetectionStrategy, Component, computed, inject, OnInit, signal} from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import {ForumNav} from '@features/social/component/forum-nav/forum-nav';
import {PostService} from '@features/social/service/post.service';
import {MatFormField, MatLabel, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {AddPostDialog} from '@features/social/component/add-post-dialog/add-post-dialog';
import {RouterLink} from '@angular/router';
import {DatePipe} from '@angular/common';
import {AppRoutes} from '@shared/route/app-routes.enum';
import {RelativeTimePipe} from '@shared/pipe/relative-time.pipe';
import {avatarGradient, initials} from '@shared/util/avatar.util';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-forum',
  imports: [
    Header,
    Footer,
    ForumNav,
    MatFormField,
    MatLabel,
    MatIcon,
    MatInput,
    MatSuffix,
    MatButton,
    RouterLink,
    DatePipe,
    RelativeTimePipe,
  ],
  templateUrl: './forum.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './forum.css'
})
export class Forum implements OnInit {

  private readonly postService = inject(PostService);
  private readonly dialog = inject(MatDialog);

  readonly AppRoutes = AppRoutes;
  protected readonly initials = initials;
  protected readonly avatarGradient = avatarGradient;

  postList = this.postService.postList;

  searchTerm = signal('');
  visibleCount = signal(PAGE_SIZE);

  ngOnInit() {
    this.postService.getPosts().subscribe();
  }

  /** Discussions filtrées par sujet, code postal ou auteur. */
  filteredPosts = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const posts = this.postList();

    if (!posts || !search) {
      return posts;
    }

    const searchTerms = search.split(' ').filter(term => term.length > 0);

    return posts.filter(post => {
      const searchableText = [
        post.title,
        post.postalCode,
        post.user.displayName,
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });
  });

  /** Sous-ensemble affiché, révélé progressivement via "Voir plus". */
  visiblePosts = computed(() => this.filteredPosts()?.slice(0, this.visibleCount()) ?? null);

  hasMore = computed(() => (this.filteredPosts()?.length ?? 0) > this.visibleCount());

  onSearchChange(searchValue: string) {
    this.searchTerm.set(searchValue);
    this.visibleCount.set(PAGE_SIZE);
  }

  onClearSearch() {
    this.searchTerm.set('');
    this.visibleCount.set(PAGE_SIZE);
  }

  onShowMore() {
    this.visibleCount.update(count => count + PAGE_SIZE);
  }

  onOpenDialogAddPost() {
    this.dialog.open(AddPostDialog, {
      width: '800px',
    });
  }
}
