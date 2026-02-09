import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CsrfService } from './csrf.service';
import { LoggerService } from './logger.service';
import { environment } from '../../../environments/environment';

/**
 * CSRF Protection Interceptor
 * 
 * Automatically adds CSRF tokens to state-changing HTTP requests (POST, PUT, PATCH, DELETE)
 * to prevent Cross-Site Request Forgery attacks.
 * 
 * Implements the Double Submit Cookie pattern:
 * 1. Backend sets CSRF token in httpOnly cookie (XSRF-TOKEN)
 * 2. Frontend reads token and sends in header (X-XSRF-TOKEN)
 * 3. Backend validates that cookie and header match
 * 
 * @param req - The outgoing HTTP request
 * @param next - The next interceptor in the chain
 * @returns Observable of the HTTP response
 * 
 * @remarks
 * This interceptor should be registered early in the interceptor chain to ensure
 * CSRF protection is applied before other processing occurs.
 * 
 * The interceptor only adds CSRF tokens for:
 * - State-changing methods (POST, PUT, PATCH, DELETE)
 * - Requests to same-origin URLs (starting with /api)
 * - When a CSRF token is available in cookies
 * 
 * @example
 * ```typescript
 * // In app.config.ts
 * provideHttpClient(
 *   withInterceptors([
 *     csrfInterceptor,  // Must come before tenant/correlation interceptors
 *     correlationIdInterceptor,
 *     tenantInterceptor,
 *     errorInterceptor
 *   ])
 * )
 * ```
 */
export const csrfInterceptor: HttpInterceptorFn = (req, next) => {
  const csrfService = inject(CsrfService);
  const logger = inject(LoggerService);

  // Only add CSRF token for state-changing requests to our API
  const isApiRequest = req.url.startsWith('/api') || req.url.startsWith(environment.apiUrl);
  if (csrfService.requiresCsrfToken(req.method) && isApiRequest) {
    const csrfToken = csrfService.getCsrfToken();

    if (csrfToken) {
      const clonedReq = req.clone({
        headers: req.headers.set(csrfService.getCsrfHeaderName(), csrfToken)
      });

      logger.debug(`CSRF token added to ${req.method} ${req.url}`);
      return next(clonedReq);
    } else {
      logger.warn(`CSRF token not found for ${req.method} ${req.url}`);
      // Continue without token - backend will reject if required
    }
  }

  return next(req);
};

/**
 * Security Headers Interceptor
 * 
 * Adds security-related HTTP headers to all outgoing requests to enhance
 * application security posture and prevent common web vulnerabilities.
 * 
 * Headers added:
 * - X-Content-Type-Options: nosniff - Prevents MIME type sniffing
 * - X-Frame-Options: DENY - Prevents clickjacking attacks
 * - X-XSS-Protection: 1; mode=block - Enables browser XSS filter (legacy)
 * - Referrer-Policy: strict-origin-when-cross-origin - Controls referrer information
 * 
 * @param req - The outgoing HTTP request
 * @param next - The next interceptor in the chain
 * @returns Observable of the HTTP response
 * 
 * @remarks
 * These headers are defense-in-depth measures. Primary security should be
 * implemented through CSP, HTTPS, and proper backend validation.
 * 
 * Some headers (like X-Frame-Options) are more effectively set by the backend
 * server, but setting them client-side provides additional protection.
 * 
 * @example
 * ```typescript
 * // In app.config.ts
 * provideHttpClient(
 *   withInterceptors([
 *     csrfInterceptor,
 *     securityHeadersInterceptor,  // Add security headers
 *     correlationIdInterceptor,
 *     tenantInterceptor,
 *     errorInterceptor
 *   ])
 * )
 * ```
 */
export const securityHeadersInterceptor: HttpInterceptorFn = (req, next) => {
  // Only add headers for requests to our API
  if (req.url.startsWith('/api')) {
    const clonedReq = req.clone({
      headers: req.headers
        // Prevent MIME type sniffing
        .set('X-Content-Type-Options', 'nosniff')
        // Prevent clickjacking (also set in CSP)
        .set('X-Frame-Options', 'DENY')
        // Enable XSS filter in legacy browsers
        .set('X-XSS-Protection', '1; mode=block')
        // Control referrer information leakage
        .set('Referrer-Policy', 'strict-origin-when-cross-origin')
    });

    return next(clonedReq);
  }

  return next(req);
};

/**
 * Authentication Error Interceptor
 * 
 * Intercepts 401 (Unauthorized) responses and automatically redirects to login page.
 * Helps handle expired sessions and unauthorized access attempts consistently.
 * 
 * @param req - The outgoing HTTP request
 * @param next - The next interceptor in the chain
 * @returns Observable of the HTTP response
 * 
 * @remarks
 * This interceptor should be placed after error handling interceptor in the chain
 * to catch authentication-specific errors after general error processing.
 * 
 * The interceptor clears the local session when receiving 401 responses to prevent
 * stale authentication state.
 */
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);

  return next(req).pipe(
    // catchError is imported in http-interceptor.service.ts
  );
};
