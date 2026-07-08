import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./components/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: 'posts',
    loadComponent: () =>
      import('./components/posts-list/posts-list.component').then(m => m.PostsListComponent),
    canActivate: [authGuard]
  },
  {
    path: 'posts/new',
    loadComponent: () =>
      import('./components/create-post/create-post.component').then(m => m.CreatePostComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: '/posts',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/posts'
  }
];
