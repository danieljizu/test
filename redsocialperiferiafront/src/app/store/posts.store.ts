import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { Router } from '@angular/router';
import { PostService } from '../services/post.service';
import { Post, CreatePostRequest, LikeUpdate } from '../models/post.models';

export interface PostsState {
  posts: Post[];
  loading: boolean;
  error: string | null;
  creating: boolean;
}

const initialState: PostsState = {
  posts: [],
  loading: false,
  error: null,
  creating: false
};

export const PostsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const postService = inject(PostService);
    const router = inject(Router);

    return {
      loadPosts(): void {
        patchState(store, { loading: true, error: null });

        postService.getPosts().subscribe({
          next: (posts: Post[]) => {
            patchState(store, {
              posts,
              loading: false,
              error: null
            });
          },
          error: (err) => {
            const errorMessage = err?.error?.message || 'Error al cargar las publicaciones.';
            patchState(store, {
              loading: false,
              error: errorMessage
            });
          }
        });
      },

      createPost(request: CreatePostRequest): void {
        patchState(store, { creating: true, error: null });

        postService.createPost(request).subscribe({
          next: (post: Post) => {
            patchState(store, {
              creating: false,
              error: null
            });
            router.navigate(['/posts']);
          },
          error: (err) => {
            const errorMessage = err?.error?.message || 'Error al crear la publicación.';
            patchState(store, {
              creating: false,
              error: errorMessage
            });
          }
        });
      },

      likePost(postId: number): void {
        postService.likePost(postId).subscribe({
          next: (update: LikeUpdate) => {
            const currentPosts = store.posts();
            const updatedPosts = currentPosts.map(p =>
              p.id === update.postId ? { ...p, likesCount: update.likesCount } : p
            );
            patchState(store, { posts: updatedPosts });
          },
          error: (err) => {
            console.error('Error al dar like:', err);
          }
        });
      },

      updateLikeCount(update: LikeUpdate): void {
        const currentPosts = store.posts();
        const updatedPosts = currentPosts.map(p =>
          p.id === update.postId ? { ...p, likesCount: update.likesCount } : p
        );
        patchState(store, { posts: updatedPosts });
      }
    };
  })
);
