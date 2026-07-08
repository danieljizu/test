import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PostsStore } from '../../store/posts.store';

const MAX_MESSAGE_LENGTH = 500;

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  template: `
    <div class="container">
      <div class="create-header">
        <h1>Nueva Publicación</h1>
        <a mat-button routerLink="/posts">
          <mat-icon>arrow_back</mat-icon>
          Volver
        </a>
      </div>

      <mat-card class="create-card">
        <mat-card-content>
          <form [formGroup]="postForm" (ngSubmit)="onSubmit()">
            <mat-form-field class="full-width" appearance="outline">
              <mat-label>¿Qué quieres compartir?</mat-label>
              <textarea
                matInput
                formControlName="message"
                placeholder="Escribe tu publicación aquí..."
                rows="6"
                [maxlength]="maxLength"
              ></textarea>
              <mat-hint align="end">
                {{ messageLength }}/{{ maxLength }}
              </mat-hint>
              <mat-error *ngIf="postForm.get('message')?.hasError('required')">
                El mensaje es requerido
              </mat-error>
              <mat-error *ngIf="postForm.get('message')?.hasError('maxlength')">
                El mensaje no puede superar los {{ maxLength }} caracteres
              </mat-error>
              <mat-error *ngIf="postForm.get('message')?.hasError('minlength')">
                El mensaje debe tener al menos 1 caracter
              </mat-error>
            </mat-form-field>

            <div class="char-counter" [class.near-limit]="messageLength > maxLength * 0.8" [class.at-limit]="messageLength === maxLength">
              <span *ngIf="messageLength === maxLength">Has alcanzado el límite de caracteres</span>
            </div>

            <div *ngIf="postsStore.error()" class="error-message">
              <mat-icon>error_outline</mat-icon>
              {{ postsStore.error() }}
            </div>

            <div class="form-actions">
              <a mat-stroked-button routerLink="/posts" [disabled]="postsStore.creating()">
                Cancelar
              </a>
              <button
                mat-raised-button
                color="primary"
                type="submit"
                [disabled]="postForm.invalid || postsStore.creating()"
              >
                <mat-spinner *ngIf="postsStore.creating()" diameter="20"></mat-spinner>
                <mat-icon *ngIf="!postsStore.creating()">send</mat-icon>
                <span>{{ postsStore.creating() ? 'Publicando...' : 'Publicar' }}</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .create-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 24px;
    }

    .create-header h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 500;
      color: #3f51b5;
    }

    .create-card {
      padding: 16px;
    }

    textarea {
      resize: vertical;
      min-height: 120px;
    }

    .char-counter {
      text-align: right;
      font-size: 12px;
      margin-top: -8px;
      margin-bottom: 8px;
      min-height: 20px;
    }

    .char-counter.near-limit {
      color: #ff9800;
    }

    .char-counter.at-limit {
      color: #f44336;
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
      background: #ffebee;
      padding: 12px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 14px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 16px;
    }

    .form-actions button {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    mat-spinner {
      display: inline-block;
      margin-right: 6px;
    }
  `]
})
export class CreatePostComponent {
  readonly postsStore = inject(PostsStore);
  private readonly fb = inject(FormBuilder);

  readonly maxLength = MAX_MESSAGE_LENGTH;

  postForm: FormGroup = this.fb.group({
    message: ['', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(MAX_MESSAGE_LENGTH)
    ]]
  });

  get messageLength(): number {
    return this.postForm.get('message')?.value?.length ?? 0;
  }

  onSubmit(): void {
    if (this.postForm.valid) {
      const message: string = this.postForm.get('message')?.value?.trim();
      if (message) {
        this.postsStore.createPost({ message });
      }
    } else {
      this.postForm.markAllAsTouched();
    }
  }
}
