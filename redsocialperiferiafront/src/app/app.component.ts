import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthStore } from './store/auth.store';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <mat-toolbar color="primary" *ngIf="authStore.token()">
      <span class="app-title">Red Social Periferia</span>
      <span class="spacer"></span>
      <a mat-button routerLink="/posts" routerLinkActive="active-link">
        <mat-icon>home</mat-icon>
        Publicaciones
      </a>
      <a mat-button routerLink="/profile" routerLinkActive="active-link">
        <mat-icon>person</mat-icon>
        Perfil
      </a>
      <button mat-button (click)="logout()">
        <mat-icon>logout</mat-icon>
        Salir
      </button>
    </mat-toolbar>

    <router-outlet></router-outlet>
  `,
  styles: [`
    mat-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .app-title {
      font-size: 1.2rem;
      font-weight: 500;
    }
    .spacer {
      flex: 1 1 auto;
    }
    .active-link {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
    }
    a mat-icon, button mat-icon {
      margin-right: 4px;
    }
  `]
})
export class AppComponent {
  readonly authStore = inject(AuthStore);

  logout(): void {
    this.authStore.logout();
  }
}
