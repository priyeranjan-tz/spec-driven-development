import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { LoggerService } from '../services/logger.service';

/**
 * Route guard that protects routes requiring authentication.
 * 
 * Checks if the user is authenticated before allowing access to protected routes.
 * Redirects to login page with return URL if authentication is not present.
 * 
 * @param route - The activated route snapshot
 * @param state - The router state snapshot containing the target URL
 * @returns True if user is authenticated, false otherwise (triggers redirect)
 * 
 * @remarks
 * This is a functional guard (CanActivateFn) compatible with Angular 14+ standalone APIs.
 * Uses AuthService which stores tokens in httpOnly cookies for enhanced security.
 * 
 * Security features:
 * - Validates authentication via secure AuthService
 * - Checks token expiration automatically
 * - Redirects with return URL for seamless user experience
 * - Logs authentication attempts for audit trail
 * 
 * @example
 * ```typescript
 * // In route configuration
 * const routes: Routes = [
 *   {
 *     path: 'accounts',
 *     component: AccountListComponent,
 *     canActivate: [authGuard] // Requires authentication
 *   },
 *   {
 *     path: 'invoices',
 *     component: InvoiceListComponent,
 *     canActivate: [authGuard, tenantGuard] // Multiple guards
 *   }
 * ];
 * ```
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    logger.warn('AuthGuard: User not authenticated, redirecting to login');
    // Redirect to login with return URL
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  return true;
};
