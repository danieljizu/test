import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AuthStore } from '../../store/auth.store';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <mat-card-title>Red Social Periferia</mat-card-title>
          <mat-card-subtitle>Inicia sesión para continuar</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="full-width" appearance="outline">
              <mat-label>Usuario</mat-label>
              <input
                matInput
                formControlName="username"
                placeholder="Ingresa tu usuario"
                autocomplete="username"
              />
              <mat-icon matSuffix>person</mat-icon>
              <mat-error *ngIf="loginForm.get('username')?.hasError('required')">
                El usuario es requerido
              </mat-error>
            </mat-form-field>

            <mat-form-field class="full-width" appearance="outline">
              <mat-label>Contraseña</mat-label>
              <input
                matInput
                [type]="hidePassword ? 'password' : 'text'"
                formControlName="password"
                placeholder="Ingresa tu contraseña"
                autocomplete="current-password"
              />
              <button
                mat-icon-button
                matSuffix
                type="button"
                (click)="hidePassword = !hidePassword"
                [attr.aria-label]="'Mostrar contraseña'"
              >
                <mat-icon>{{ hidePassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                La contraseña es requerida
              </mat-error>
              <mat-error *ngIf="loginForm.get('password')?.hasError('minlength')">
                La contraseña debe tener al menos 4 caracteres
              </mat-error>
            </mat-form-field>

            <div class="error-message" *ngIf="authStore.error()">
              <mat-icon>error_outline</mat-icon>
              {{ authStore.error() }}
            </div>

            <button
              mat-raised-button
              color="primary"
              type="submit"
              class="full-width login-btn"
              [disabled]="loginForm.invalid || authStore.loading()"
            >
              <mat-spinner *ngIf="authStore.loading()" diameter="20"></mat-spinner>
              <span *ngIf="!authStore.loading()">Iniciar Sesión</span>
            </button>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #3f51b5 0%, #7c4dff 100%);
      padding: 16px;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      padding: 24px;
    }

    mat-card-header {
      margin-bottom: 24px;
    }

    mat-card-title {
      font-size: 1.8rem !important;
      font-weight: 600 !important;
      color: #3f51b5;
    }

    mat-form-field {
      margin-bottom: 8px;
    }

    .login-btn {
      margin-top: 16px;
      height: 48px;
      font-size: 1rem;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
      background: #ffebee;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 8px;
      font-size: 14px;
    }

    mat-spinner {
      display: inline-block;
    }
  `]
})
export class LoginComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  hidePassword = true;

  loginForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(4)]]
  });

  ngOnInit(): void {
    // Redirect if already authenticated
    if (this.authStore.token()) {
      this.router.navigate(['/posts']);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.authStore.login(this.loginForm.value);
    } else {
      this.loginForm.markAllAsTouched();
    }
  }
}
