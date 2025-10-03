import {Component, computed, effect, inject, OnInit, signal, viewChild} from '@angular/core';
import {Header} from '@core/layout/header/header';
import {Footer} from '@core/layout/footer/footer';
import {PostService} from '@features/social/service/post.service';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable, MatTableDataSource
} from '@angular/material/table';
import {MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatInput, MatLabel} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {AddPostDialog} from '@features/social/component/add-post-dialog/add-post-dialog';
import {MatPaginator} from '@angular/material/paginator';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {PostDto} from '@features/social/data/dto/post.dto';
import {AppRoutes} from '@shared/route/app-routes.enum';
@Component({
  selector: 'app-forum',
  imports: [
    Header,
    Footer,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCell,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatRowDef,
    MatHeaderRowDef,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
    MatSuffix,
    MatButton,
    MatPaginator,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './forum.html',
  styleUrl: './forum.css'
})
export class Forum implements OnInit {

  postService = inject(PostService);
  dialog = inject(MatDialog);

  paginator = viewChild(MatPaginator);
  dataSource = new MatTableDataSource<PostDto>([]);

  postList = this.postService.postList;

  searchTerm = signal('');

  displayedColumns: string[] = ['title', 'postalCode','commentCount', 'user' ];
  readonly AppRoutes = AppRoutes;

  ngOnInit() {
    this.postService.getPosts().subscribe();
  }

  constructor() {
    // mettre à jour le dataSource
    effect(() => {
      const posts = this.filteredProducts();
      if (posts) {
        this.dataSource.data = posts;
      }
    });

    // connecter le paginator
    effect(() => {
      const pag = this.paginator();
      if (pag) {
        this.dataSource.paginator = pag;
      }
    });
  }


  filteredProducts = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const posts = this.postList();

    if (!search || !posts) {
      return posts;
    }

    const searchTerms = search.split(' ').filter(term => term.length > 0);

    return posts.filter(product => {
      const searchableText = [
        product.title,
        product.postalCode,
        product.user.username,
      ].join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });

  })


  // getPostDetailUrl(postId: string): string {
  //   return AppRoutes.POST_PAGE.replace(':postId', postId);
  // }

  onSearchChange(searchValue: string) {
    this.searchTerm.set(searchValue);
  }

  onClearSearch() {
    this.searchTerm.set('')
  }

  onOpenDialogAddPost() {
    const dialogRef = this.dialog.open(AddPostDialog, {
      width: '800px',
    })
  }
}
