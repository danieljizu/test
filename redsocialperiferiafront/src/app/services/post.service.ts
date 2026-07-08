import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Post, CreatePostRequest, LikeUpdate } from '../models/post.models';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/posts';

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl);
  }

  createPost(request: CreatePostRequest): Observable<Post> {
    return this.http.post<Post>(this.baseUrl, request);
  }

  likePost(postId: number): Observable<LikeUpdate> {
    return this.http.post<LikeUpdate>(`${this.baseUrl}/${postId}/likes`, {});
  }
}
