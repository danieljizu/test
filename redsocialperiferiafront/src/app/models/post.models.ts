export interface PostAuthor {
  id: number;
  alias: string;
  firstName: string;
  lastName: string;
}

export interface Post {
  id: number;
  message: string;
  publishedAt: string;
  author: PostAuthor;
  likesCount: number;
}

export interface CreatePostRequest {
  message: string;
}

export interface LikeUpdate {
  postId: number;
  likesCount: number;
}
