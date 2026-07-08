import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../store/auth.store';

export const authGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);

  const token = authStore.token();

  if (token) {
    return true;
  }

  // Fallback: check localStorage directly in case store hasn't hydrated
  const storedToken = localStorage.getItem('rsp_token');
  if (storedToken) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
