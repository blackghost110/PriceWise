export interface PostDto {
  created: string;
  postId: number;
  title: string;
  message: string;
  postalCode: string;
  user: { username: string;};
  commentCount: number;
}
