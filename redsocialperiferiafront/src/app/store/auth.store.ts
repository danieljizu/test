import { inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoginRequest, AuthResponse, UserProfile } from '../models/auth.models';

const TOKEN_KEY = 'rsp_token';

export interface AuthState {
  token: string | null;
  user: AuthResponse | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

function getInitialToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  token: getInitialToken(),
  user: null,
  profile: null,
  loading: false,
  error: null
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    return {
      login(request: LoginRequest): void {
        patchState(store, { loading: true, error: null });

        authService.login(request).subscribe({
          next: (response: AuthResponse) => {
            try {
              localStorage.setItem(TOKEN_KEY, response.token);
            } catch (e) {
              console.warn('Could not save token to localStorage:', e);
            }
            patchState(store, {
              token: response.token,
              user: response,
              loading: false,
              error: null
            });
            router.navigate(['/posts']);
          },
          error: (err) => {
            const errorMessage = err?.error?.message || 'Credenciales incorrectas. Por favor, intente nuevamente.';
            patchState(store, {
              loading: false,
              error: errorMessage,
              token: null,
              user: null
            });
          }
        });
      },

      loadProfile(): void {
        patchState(store, { loading: true, error: null });

        authService.getProfile().subscribe({
          next: (profile: UserProfile) => {
            patchState(store, {
              profile,
              loading: false,
              error: null
            });
          },
          error: (err) => {
            const errorMessage = err?.error?.message || 'Error al cargar el perfil.';
            patchState(store, {
              loading: false,
              error: errorMessage
            });
          }
        });
      },

      logout(): void {
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch (e) {
          console.warn('Could not remove token from localStorage:', e);
        }
        patchState(store, {
          token: null,
          user: null,
          profile: null,
          loading: false,
          error: null
        });
        router.navigate(['/login']);
      }
    };
  })
);
