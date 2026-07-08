import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthStore } from './auth.store';
import { AuthService } from '../services/auth.service';
import { AuthResponse, UserProfile } from '../models/auth.models';

describe('AuthStore', () => {
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  const mockAuthResponse: AuthResponse = {
    token: 'test-token-123',
    tokenType: 'Bearer',
    userId: 1,
    username: 'testuser',
    alias: 'tester'
  };

  const mockProfile: UserProfile = {
    id: 1,
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    birthDate: '1990-01-15',
    alias: 'tester',
    email: 'test@example.com'
  };

  beforeEach(() => {
    authService = jasmine.createSpyObj('AuthService', ['login', 'getProfile']);
    router = jasmine.createSpyObj('Router', ['navigate']);

    // Clear localStorage before each test
    localStorage.removeItem('rsp_token');

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: router }
      ]
    });
  });

  afterEach(() => {
    localStorage.removeItem('rsp_token');
  });

  it('should initialize with null token when localStorage is empty', () => {
    const store = TestBed.inject(AuthStore);
    expect(store.token()).toBeNull();
    expect(store.user()).toBeNull();
    expect(store.profile()).toBeNull();
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('should set token and user on successful login', () => {
    authService.login.and.returnValue(of(mockAuthResponse));
    const store = TestBed.inject(AuthStore);

    store.login({ username: 'testuser', password: 'pass123' });

    expect(store.token()).toBe('test-token-123');
    expect(store.user()).toEqual(mockAuthResponse);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
    expect(localStorage.getItem('rsp_token')).toBe('test-token-123');
    expect(router.navigate).toHaveBeenCalledWith(['/posts']);
  });

  it('should set error state on failed login', () => {
    const errorResponse = { error: { message: 'Credenciales inválidas' } };
    authService.login.and.returnValue(throwError(() => errorResponse));
    const store = TestBed.inject(AuthStore);

    store.login({ username: 'wrong', password: 'wrong' });

    expect(store.token()).toBeNull();
    expect(store.user()).toBeNull();
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBe('Credenciales inválidas');
    expect(localStorage.getItem('rsp_token')).toBeNull();
  });

  it('should load profile successfully', () => {
    authService.getProfile.and.returnValue(of(mockProfile));
    const store = TestBed.inject(AuthStore);

    store.loadProfile();

    expect(store.profile()).toEqual(mockProfile);
    expect(store.loading()).toBeFalse();
    expect(store.error()).toBeNull();
  });

  it('should set error when profile load fails', () => {
    const errorResponse = { error: { message: 'No autorizado' } };
    authService.getProfile.and.returnValue(throwError(() => errorResponse));
    const store = TestBed.inject(AuthStore);

    store.loadProfile();

    expect(store.profile()).toBeNull();
    expect(store.error()).toBe('No autorizado');
    expect(store.loading()).toBeFalse();
  });

  it('should clear state and navigate to login on logout', () => {
    authService.login.and.returnValue(of(mockAuthResponse));
    const store = TestBed.inject(AuthStore);

    // First login
    store.login({ username: 'testuser', password: 'pass123' });
    expect(store.token()).toBe('test-token-123');

    // Then logout
    store.logout();

    expect(store.token()).toBeNull();
    expect(store.user()).toBeNull();
    expect(store.profile()).toBeNull();
    expect(localStorage.getItem('rsp_token')).toBeNull();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should set loading to true while login is in progress', () => {
    // Use a deferred observable to capture loading state mid-flight
    let resolveLogin!: (value: AuthResponse) => void;
    const loginPromise = new Promise<AuthResponse>(resolve => { resolveLogin = resolve; });
    authService.login.and.returnValue(
      new (require('rxjs').Observable)((subscriber: any) => {
        loginPromise.then(v => { subscriber.next(v); subscriber.complete(); });
      })
    );

    const store = TestBed.inject(AuthStore);
    store.login({ username: 'testuser', password: 'pass123' });

    expect(store.loading()).toBeTrue();
  });
});
