export interface CommentDto {
  created: string;
  commentId: number;
  message: string;
  user: { displayName: string; activeBadge: string | null; };
}
