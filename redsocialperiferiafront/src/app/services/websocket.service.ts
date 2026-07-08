import { Injectable, OnDestroy, inject } from '@angular/core';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Subject, Observable } from 'rxjs';
import { LikeUpdate } from '../models/post.models';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService implements OnDestroy {
  private client: Client | null = null;
  private likeUpdates$ = new Subject<LikeUpdate>();
  private subscribedPostIds: Set<number> = new Set();

  connect(): void {
    if (this.client?.active) {
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8082/ws'),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket connected');
        // Re-subscribe to all previously subscribed posts on reconnect
        this.subscribedPostIds.forEach(postId => {
          this.subscribeToPost(postId);
        });
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
      }
    });

    this.client.activate();
  }

  subscribeToPost(postId: number): void {
    this.subscribedPostIds.add(postId);

    if (!this.client?.active) {
      return;
    }

    this.client.subscribe(`/topic/likes/${postId}`, (message: IMessage) => {
      try {
        const update: LikeUpdate = JSON.parse(message.body);
        this.likeUpdates$.next(update);
      } catch (e) {
        console.error('Error parsing WebSocket message:', e);
      }
    });
  }

  subscribeToPosts(postIds: number[]): void {
    postIds.forEach(id => this.subscribeToPost(id));
  }

  getLikeUpdates(): Observable<LikeUpdate> {
    return this.likeUpdates$.asObservable();
  }

  disconnect(): void {
    if (this.client?.active) {
      this.client.deactivate();
    }
    this.subscribedPostIds.clear();
  }

  ngOnDestroy(): void {
    this.disconnect();
    this.likeUpdates$.complete();
  }
}
