import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { TenantService } from './tenant.service';
import { LoggerService } from './logger.service';
import { v4 as uuidv4 } from 'uuid';
import { environment } from '../../../environments/environment';

/**
 * HTTP Interceptor that injects the X-Tenant-ID header for tenant isolation.
 * 
 * Ensures all API requests include the current tenant context to enforce
 * multi-tenancy at the HTTP layer. Only adds the header for requests to /api endpoints
 * when a tenant is set in the TenantService.
 * 
 * @param req - The outgoing HTTP request
 * @param next - The next interceptor in the chain
 * @returns Observable of the HTTP response
 * 
 * @remarks
 * This interceptor is registered in app.config.ts and runs for all HTTP requests.
 * The backend must validate the X-Tenant-ID header to prevent cross-tenant data access.
 * 
 * @example
 * ```typescript
 * // In app.config.ts
 * provideHttpClient(
 *   withInterceptors([tenantInterceptor, correlationIdInterceptor, errorInterceptor])
 * )
 * ```
 */
export const tenantInterceptor: HttpInterceptorFn = (req, next) => {
  const tenantService = inject(TenantService);

  // Only add tenant header if tenant is set and request is to API
  const isApiRequest = req.url.startsWith('/api') || req.url.startsWith(environment.apiUrl);
  if (tenantService.hasTenant() && isApiRequest) {
    const tenantId = tenantService.getCurrentTenantId();
    const clonedReq = req.clone({
      headers: req.headers.set('X-Tenant-ID', tenantId)
    });
    return next(clonedReq);
  }

  return next(req);
};

/**
 * HTTP Interceptor that generates and injects X-Correlation-ID header for request tracing.
 * 
 * Generates a UUID v4 correlation ID for each request, enabling end-to-end request
 * tracing across frontend and backend services. Essential for debugging and monitoring
 * in distributed systems.
 * 
 * @param req - The outgoing HTTP request
 * @param next - The next interceptor in the chain
 * @returns Observable of the HTTP response
 * 
 * @remarks
 * The correlation ID is logged with errors in the errorInterceptor and can be provided
 * to backend teams for troubleshooting specific requests.
 * 
 * @example
 * ```typescript
 * // Correlation ID is automatically added to all requests:
 * // X-Correlation-ID: 550e8400-e29b-41d4-a716-446655440000
 * ```
 */
export const correlationIdInterceptor: HttpInterceptorFn = (req, next) => {
  // Generate UUID v4 for correlation
  const correlationId = uuidv4();
  
  const clonedReq = req.clone({
    headers: req.headers.set('X-Correlation-ID', correlationId)
  });

  return next(clonedReq);
};

/**
 * HTTP Interceptor for centralized error handling and user-friendly error messages.
 * 
 * Catches all HTTP errors from API calls and transforms them into user-friendly messages
 * based on status codes. Distinguishes between client-side network errors and backend
 * errors, providing appropriate feedback for each scenario.
 * 
 * @param req - The outgoing HTTP request
 * @param next - The next interceptor in the chain
 * @returns Observable of the HTTP response with enhanced error information
 * 
 * @throws Enhanced error object with message, status, and originalError properties
 * 
 * @remarks
 * Error messages are mapped from HTTP status codes:
 * - 0: Network connectivity issues
 * - 401: Session expired/authentication required
 * - 403: Permission denied
 * - 404: Resource not found
 * - 500/502/503: Server errors
 * 
 * All errors are logged with the correlation ID for traceability.
 * 
 * @example
 * ```typescript
 * this.http.get('/api/resource').subscribe({
 *   error: (err) => {
 *     // err.message contains user-friendly message
 *     // err.status contains HTTP status code
 *     // err.originalError contains the original HttpErrorResponse
 *   }
 * });
 * ```
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const logger = inject(LoggerService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred';

      if (error.error instanceof ErrorEvent) {
        // Client-side or network error
        errorMessage = `Network error: ${error.error.message}`;
        logger.error('Client-side error', { message: error.error.message });
      } else {
        // Backend error response
        switch (error.status) {
          case 0:
            errorMessage = 'Unable to connect to server. Please check your internet connection.';
            break;
          case 401:
            errorMessage = 'Session expired. Please log in again.';
            break;
          case 403:
            errorMessage = 'You do not have permission to access this resource.';
            break;
          case 404:
            errorMessage = 'The requested resource was not found.';
            break;
          case 500:
          case 502:
          case 503:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = error.error?.message || `Error: ${error.statusText}`;
        }

        logger.error('HTTP Error', {
          status: error.status,
          message: errorMessage,
          url: req.url,
          correlationId: req.headers.get('X-Correlation-ID')
        });
      }

      // Re-throw with enhanced error information
      return throwError(() => ({
        message: errorMessage,
        status: error.status,
        originalError: error
      }));
    })
  );
};
