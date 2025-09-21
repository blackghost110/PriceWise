export interface CommentDto {
  created: string;
  commentId: number;
  message: string;
  user: { username: string;};
}
