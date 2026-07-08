import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { PostsStore } from './posts.store';
import { PostService } from '../services/post.service';
import { Post, LikeUpdate } from '../models/post.models';

describe('PostsStore', () => {
  let postService: jasmine.SpyObj<PostService>;
  let router: jasmine.SpyObj<Router>;

  const mockPosts: Post[] = [
    {
      id: 1,
      message: 'Primer post de prueba',
      publishedAt: '2024-01-15T10:00:00Z',
      author: { id: 2, alias: 'otrousuario', firstName: 'Otro', lastName: 'Usuario' },
      likesCount: 5
    },
    {
      id: 2,
      message: 'Segundo post de prueba',
      publishedAt: '2024-01-15T11:00:00Z',
      author: { id: 3, alias: 'tercero', firstName: 'Tercer', lastName: 'Usuario' },
      likesCount: 3
    }
  ];

  const mockNewPost: Post = {
    id: 3,
    message: 'Mi nueva publicación',
    publishedAt: '2024-01-15T12:00:00Z',
    author: { id: 1, alias: 'yo', firstName: 'Mi', lastName: 'Nombre' },
    likesCount: 0
  };

  beforeEach(() => {
    postService = jasmine.createSpyObj('PostService', ['getPosts', 'createPost', 'likePost']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        { provide: PostService, useValue: postService },
        { provide: Router, useValue: router }
      ]
    });
  });

  it('should initialize with empty posts and no loading', () => {
    const store = TestBed.inject(PostsStore);
    expect(store.posts()).toEqual([]);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
    expect(store.creating()).toBeFalse();
  });

  it('should load posts successfully', () => {
    postService.getPosts.and.returnValue(of(mockPosts));
    const store = TestBed.inject(PostsStore);

    store.loadPosts();

    expect(store.posts().length).toBe(2);
    expect(store.posts()).toEqual(mockPosts);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('should set error when loading posts fails', () => {
    const errorResponse = { error: { message: 'Error al cargar posts' } };
    postService.getPosts.and.returnValue(throwError(() => errorResponse));
    const store = TestBed.inject(PostsStore);

    store.loadPosts();

    expect(store.posts()).toEqual([]);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBe('Error al cargar posts');
  });

  it('should navigate to /posts after creating a post successfully', () => {
    postService.createPost.and.returnValue(of(mockNewPost));
    const store = TestBed.inject(PostsStore);

    store.createPost({ message: 'Mi nueva publicación' });

    expect(store.creating()).toBeFalse();
    expect(store.error()).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/posts']);
  });

  it('should set error when creating post fails', () => {
    const errorResponse = { error: { message: 'No se pudo crear la publicación' } };
    postService.createPost.and.returnValue(throwError(() => errorResponse));
    const store = TestBed.inject(PostsStore);

    store.createPost({ message: 'Mi post' });

    expect(store.creating()).toBeFalse();
    expect(store.error()).toBe('No se pudo crear la publicación');
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should update like count for a specific post when likePost is called', () => {
    postService.getPosts.and.returnValue(of(mockPosts));
    const likeUpdate: LikeUpdate = { postId: 1, likesCount: 6 };
    postService.likePost.and.returnValue(of(likeUpdate));
    const store = TestBed.inject(PostsStore);

    store.loadPosts();
    store.likePost(1);

    const updatedPost = store.posts().find(p => p.id === 1);
    expect(updatedPost?.likesCount).toBe(6);
    // Other posts should not be affected
    const otherPost = store.posts().find(p => p.id === 2);
    expect(otherPost?.likesCount).toBe(3);
  });

  it('should update like count via updateLikeCount (WebSocket update)', () => {
    postService.getPosts.and.returnValue(of(mockPosts));
    const store = TestBed.inject(PostsStore);

    store.loadPosts();

    const wsUpdate: LikeUpdate = { postId: 2, likesCount: 10 };
    store.updateLikeCount(wsUpdate);

    const updatedPost = store.posts().find(p => p.id === 2);
    expect(updatedPost?.likesCount).toBe(10);
    // Post 1 should remain unchanged
    const unchangedPost = store.posts().find(p => p.id === 1);
    expect(unchangedPost?.likesCount).toBe(5);
  });

  it('should not modify posts if updateLikeCount is called for unknown postId', () => {
    postService.getPosts.and.returnValue(of(mockPosts));
    const store = TestBed.inject(PostsStore);

    store.loadPosts();

    const wsUpdate: LikeUpdate = { postId: 999, likesCount: 100 };
    store.updateLikeCount(wsUpdate);

    expect(store.posts()).toEqual(mockPosts);
  });
});
