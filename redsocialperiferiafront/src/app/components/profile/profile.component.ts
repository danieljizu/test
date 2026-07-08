import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { RouterLink } from '@angular/router';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    RouterLink
  ],
  template: `
    <div class="container">
      <div class="profile-header">
        <h1>Mi Perfil</h1>
        <a mat-button routerLink="/posts" color="primary">
          <mat-icon>arrow_back</mat-icon>
          Volver a Publicaciones
        </a>
      </div>

      <div *ngIf="authStore.loading()" class="loading-container">
        <mat-spinner diameter="48"></mat-spinner>
        <p>Cargando perfil...</p>
      </div>

      <div *ngIf="authStore.error() && !authStore.loading()" class="error-message">
        <mat-icon>error_outline</mat-icon>
        {{ authStore.error() }}
      </div>

      <mat-card *ngIf="authStore.profile() && !authStore.loading()" class="profile-card">
        <mat-card-content>
          <div class="avatar-container">
            <div class="avatar">
              <mat-icon>account_circle</mat-icon>
            </div>
            <div class="avatar-info">
              <h2>{{ authStore.profile()?.firstName }} {{ authStore.profile()?.lastName }}</h2>
              <p class="alias">&#64;{{ authStore.profile()?.alias }}</p>
            </div>
          </div>

          <mat-divider></mat-divider>

          <div class="profile-details">
            <div class="detail-item">
              <mat-icon color="primary">person</mat-icon>
              <div class="detail-content">
                <span class="detail-label">Nombre completo</span>
                <span class="detail-value">
                  {{ authStore.profile()?.firstName }} {{ authStore.profile()?.lastName }}
                </span>
              </div>
            </div>

            <div class="detail-item">
              <mat-icon color="primary">alternate_email</mat-icon>
              <div class="detail-content">
                <span class="detail-label">Usuario</span>
                <span class="detail-value">{{ authStore.profile()?.username }}</span>
              </div>
            </div>

            <div class="detail-item">
              <mat-icon color="primary">badge</mat-icon>
              <div class="detail-content">
                <span class="detail-label">Alias</span>
                <span class="detail-value">&#64;{{ authStore.profile()?.alias }}</span>
              </div>
            </div>

            <div class="detail-item">
              <mat-icon color="primary">email</mat-icon>
              <div class="detail-content">
                <span class="detail-label">Email</span>
                <span class="detail-value">{{ authStore.profile()?.email }}</span>
              </div>
            </div>

            <div class="detail-item">
              <mat-icon color="primary">cake</mat-icon>
              <div class="detail-content">
                <span class="detail-label">Fecha de nacimiento</span>
                <span class="detail-value">
                  {{ authStore.profile()?.birthDate | date:'dd/MM/yyyy' }}
                </span>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .profile-header h1 {
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

    .profile-card {
      padding: 8px;
    }

    .avatar-container {
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 16px 0 24px 0;
    }

    .avatar {
      background: #3f51b5;
      border-radius: 50%;
      width: 80px;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .avatar mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      color: white;
    }

    .avatar-info h2 {
      margin: 0 0 4px 0;
      font-size: 1.4rem;
      font-weight: 500;
    }

    .alias {
      margin: 0;
      color: #666;
      font-size: 1rem;
    }

    .profile-details {
      padding-top: 24px;
    }

    .detail-item {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 12px 0;
      border-bottom: 1px solid #f0f0f0;
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .detail-label {
      font-size: 12px;
      color: #999;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .detail-value {
      font-size: 1rem;
      color: #333;
    }
  `]
})
export class ProfileComponent implements OnInit {
  readonly authStore = inject(AuthStore);

  ngOnInit(): void {
    this.authStore.loadProfile();
  }
}
