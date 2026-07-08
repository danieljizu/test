import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PostsStore } from '../../store/posts.store';
import { WebSocketService } from '../../services/websocket.service';
import { Post } from '../../models/post.models';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatTooltipModule
  ],
  template: `
    <div class="container">
      <div class="posts-header">
        <h1>Publicaciones</h1>
        <a mat-raised-button color="primary" routerLink="/posts/new">
          <mat-icon>add</mat-icon>
          Nueva Publicación
        </a>
      </div>

      <div *ngIf="postsStore.loading()" class="loading-container">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Cargando publicaciones...</p>
      </div>

      <div *ngIf="postsStore.error() && !postsStore.loading()" class="error-card">
        <mat-icon>error_outline</mat-icon>
        <span>{{ postsStore.error() }}</span>
        <button mat-button color="primary" (click)="refresh()">Reintentar</button>
      </div>

      <div *ngIf="!postsStore.loading() && postsStore.posts().length === 0 && !postsStore.error()" class="empty-state">
        <mat-icon>forum</mat-icon>
        <h3>No hay publicaciones todavía</h3>
        <p>¡Sé el primero en publicar algo!</p>
        <a mat-raised-button color="primary" routerLink="/posts/new">Crear Publicación</a>
      </div>

      <div class="posts-list">
        <mat-card *ngFor="let post of postsStore.posts(); trackBy: trackByPostId" class="post-card">
          <mat-card-header>
            <div mat-card-avatar class="post-avatar">
              <mat-icon>account_circle</mat-icon>
            </div>
            <mat-card-title>&#64;{{ post.author.alias }}</mat-card-title>
            <mat-card-subtitle>
              {{ post.author.firstName }} {{ post.author.lastName }}
              &bull;
              {{ post.publishedAt | date:'dd/MM/yyyy HH:mm' }}
            </mat-card-subtitle>
          </mat-card-header>

          <mat-card-content>
            <p class="post-message">{{ post.message }}</p>
          </mat-card-content>

          <mat-card-actions align="start">
            <button
              mat-button
              color="warn"
              class="like-btn"
              (click)="likePost(post)"
              matTooltip="Me gusta"
            >
              <mat-icon>favorite</mat-icon>
              <span class="like-count">{{ post.likesCount }}</span>
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .posts-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .posts-header h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 500;
      color: #3f51b5;
    }

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 16px;
      padding: 48px;
      color: #666;
    }

    .error-card {
      display: flex;
      align-items: center;
      gap: 12px;
      background: #ffebee;
      color: #c62828;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 16px;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding: 64px 16px;
      color: #666;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #ccc;
    }

    .empty-state h3 {
      margin: 0;
      font-size: 1.2rem;
      color: #444;
    }

    .post-card {
      margin-bottom: 16px;
      transition: box-shadow 0.2s;
    }

    .post-card:hover {
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .post-avatar {
      background: #3f51b5;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .post-avatar mat-icon {
      color: white;
      font-size: 32px;
    }

    .post-message {
      font-size: 1rem;
      line-height: 1.6;
      color: #333;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .like-btn {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .like-count {
      font-size: 0.9rem;
      font-weight: 500;
    }

    .posts-list {
      padding-bottom: 32px;
    }
  `]
})
export class PostsListComponent implements OnInit, OnDestroy {
  readonly postsStore = inject(PostsStore);
  private readonly wsService = inject(WebSocketService);
  private wsSubscription?: Subscription;

  ngOnInit(): void {
    this.postsStore.loadPosts();
    this.connectWebSocket();
  }

  ngOnDestroy(): void {
    this.wsSubscription?.unsubscribe();
    this.wsService.disconnect();
  }

  private connectWebSocket(): void {
    this.wsService.connect();

    this.wsSubscription = this.wsService.getLikeUpdates().subscribe(update => {
      this.postsStore.updateLikeCount(update);
    });

    // Subscribe to posts as they load
    const checkPosts = setInterval(() => {
      const posts = this.postsStore.posts();
      if (posts.length > 0) {
        const postIds = posts.map(p => p.id);
        this.wsService.subscribeToPosts(postIds);
        clearInterval(checkPosts);
      }
    }, 500);

    // Also listen for new posts loaded and subscribe to them
    // We re-subscribe whenever posts change
  }

  likePost(post: Post): void {
    this.postsStore.likePost(post.id);
  }

  refresh(): void {
    this.postsStore.loadPosts();
  }

  trackByPostId(_index: number, post: Post): number {
    return post.id;
  }
}
