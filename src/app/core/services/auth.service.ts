import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, tap, map, catchError, of } from 'rxjs';
import { LoggerService } from './logger.service';

/**
 * User model for authentication.
 */
export interface User {
  id: string;
  email: string;
  name: string;
  tenantId: string;
  roles: string[];
}

/**
 * Authentication response from backend.
 */
interface AuthResponse {
  user: User;
  expiresAt: string;
}

/**
 * Authentication Service
 * 
 * Manages user authentication using httpOnly cookies for secure token storage.
 * Eliminates localStorage/sessionStorage security vulnerabilities by keeping
 * tokens in httpOnly, Secure, SameSite=Strict cookies managed by the backend.
 * 
 * @remarks
 * Security measures:
 * - Tokens stored in httpOnly cookies (not accessible to JavaScript)
 * - Cookies use Secure flag (HTTPS only) and SameSite=Strict
 * - Automatic token expiration tracking
 * - Session validation on app initialization
 * - Secure logout that clears server-side session
 * 
 * Backend requirements:
 * - POST /api/auth/login - Sets httpOnly cookie, returns user info
 * - POST /api/auth/logout - Clears httpOnly cookie
 * - GET /api/auth/session - Validates session, returns user info
 * - POST /api/auth/refresh - Refreshes token (if using refresh tokens)
 * 
 * @example
 * ```typescript
 * // Login
 * this.authService.login(email, password).subscribe({
 *   next: (user) => this.router.navigate(['/dashboard']),
 *   error: (err) => this.showError(err.message)
 * });
 * 
 * // Check authentication
 * if (this.authService.isAuthenticated()) {
 *   // User is logged in
 * }
 * 
 * // Logout
 * this.authService.logout();
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly logger = inject(LoggerService);

  private readonly currentUserSubject = new BehaviorSubject<User | null>(null);
  public readonly currentUser$ = this.currentUserSubject.asObservable();

  private tokenExpiresAt: Date | null = null;

  /**
   * Gets the current authenticated user.
   * 
   * @returns The current user or null if not authenticated
   */
  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  /**
   * Checks if the user is currently authenticated.
   * 
   * Validates both user presence and token expiration.
   * 
   * @returns True if user is authenticated and token is not expired
   */
  isAuthenticated(): boolean {
    const user = this.currentUserSubject.value;
    if (!user) {
      return false;
    }

    // Check token expiration
    if (this.tokenExpiresAt && new Date() >= this.tokenExpiresAt) {
      this.logger.warn('Authentication token expired');
      this.handleExpiredSession();
      return false;
    }

    return true;
  }

  /**
   * Authenticates user with email and password.
   * 
   * Backend sets httpOnly cookie with JWT/session token.
   * Cookie flags: HttpOnly, Secure, SameSite=Strict
   * 
   * @param email - User email
   * @param password - User password
   * @returns Observable of authenticated user
   * 
   * @example
   * ```typescript
   * this.authService.login('user@example.com', 'password').subscribe({
   *   next: (user) => this.logger.info('Logged in', { userId: user.id }),
   *   error: (err) => this.logger.error('Login failed', err)
   * });
   * ```
   */
  login(email: string, password: string): Observable<User> {
    return this.http.post<AuthResponse>('/api/auth/login', { email, password })
      .pipe(
        tap(response => {
          this.currentUserSubject.next(response.user);
          this.tokenExpiresAt = new Date(response.expiresAt);
          this.logger.info('User authenticated successfully');
          this.scheduleTokenRefresh();
        }),
        map(response => response.user)
      );
  }

  /**
   * Logs out the current user.
   * 
   * Clears server-side session and httpOnly cookie.
   * Redirects to login page after successful logout.
   */
  logout(): void {
    this.http.post('/api/auth/logout', {}).subscribe({
      next: () => {
        this.clearSession();
        this.router.navigate(['/login']);
        this.logger.info('User logged out successfully');
      },
      error: (err) => {
        // Clear local session even if server request fails
        this.clearSession();
        this.router.navigate(['/login']);
        this.logger.error('Logout request failed, cleared local session', err);
      }
    });
  }

  /**
   * Validates current session with backend.
   * 
   * Should be called on app initialization to restore user session
   * from httpOnly cookie if still valid.
   * 
   * @returns Observable of authenticated user or null if session invalid
   */
  validateSession(): Observable<User | null> {
    return this.http.get<AuthResponse>('/api/auth/session')
      .pipe(
        tap(response => {
          if (response && response.user) {
            this.currentUserSubject.next(response.user);
            this.tokenExpiresAt = new Date(response.expiresAt);
            this.scheduleTokenRefresh();
          }
        }),
        map(response => response?.user ?? null),
        catchError(() => of(null))
      );
  }

  /**
   * Refreshes the authentication token.
   * 
   * Backend rotates token and updates httpOnly cookie.
   * Should be called before token expiration.
   * 
   * @returns Observable of refreshed user session
   */
  refreshToken(): Observable<User> {
    return this.http.post<AuthResponse>('/api/auth/refresh', {})
      .pipe(
        tap(response => {
          this.currentUserSubject.next(response.user);
          this.tokenExpiresAt = new Date(response.expiresAt);
          this.scheduleTokenRefresh();
          this.logger.info('Token refreshed successfully');
        }),
        map(response => response.user)
      );
  }

  /**
   * Clears local session state.
   * @private
   */
  private clearSession(): void {
    this.currentUserSubject.next(null);
    this.tokenExpiresAt = null;
  }

  /**
   * Handles expired session by clearing state and redirecting to login.
   * @private
   */
  private handleExpiredSession(): void {
    this.clearSession();
    this.router.navigate(['/login'], {
      queryParams: { reason: 'session-expired' }
    });
  }

  /**
   * Schedules automatic token refresh before expiration.
   * Refreshes at 75% of token lifetime to ensure continuity.
   * @private
   */
  private scheduleTokenRefresh(): void {
    if (!this.tokenExpiresAt) {
      return;
    }

    const now = new Date().getTime();
    const expiresAt = this.tokenExpiresAt.getTime();
    const timeUntilExpiry = expiresAt - now;

    // Refresh at 75% of token lifetime
    const refreshAt = timeUntilExpiry * 0.75;

    if (refreshAt > 0) {
      setTimeout(() => {
        if (this.isAuthenticated()) {
          this.refreshToken().subscribe({
            error: (err) => this.logger.error('Token refresh failed', err)
          });
        }
      }, refreshAt);
    }
  }

  /**
   * Checks if user has specific role.
   * 
   * @param role - Role to check
   * @returns True if user has the role
   */
  hasRole(role: string): boolean {
    const user = this.currentUser;
    return user ? user.roles.includes(role) : false;
  }

  /**
   * Checks if user has any of the specified roles.
   * 
   * @param roles - Array of roles to check
   * @returns True if user has at least one role
   */
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }
}
