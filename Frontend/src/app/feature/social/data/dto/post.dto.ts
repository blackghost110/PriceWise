export interface PostDto {
  created: string;
  postId: number;
  title: string;
  message: string;
  postalCode: string;
  user: { displayName: string; activeBadge: string | null; };
  commentCount: number;
}
