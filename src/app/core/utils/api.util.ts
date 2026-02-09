import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, RetryConfig } from 'rxjs/operators';
import { API_CONFIG } from '../constants/app.constants';

/**
 * API utility functions for common HTTP operations.
 * 
 * Provides standardized retry logic, error handling, and error message extraction
 * to reduce duplication across API services.
 */

/**
 * Default retry configuration for API requests.
 */
export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  count: API_CONFIG.RETRY_COUNT,
  delay: API_CONFIG.RETRY_DELAY
};

/**
 * Applies standard retry logic to an observable.
 * 
 * Uses configured retry count and delay from app constants.
 * 
 * @param source - The source observable
 * @returns Observable with retry logic applied
 * 
 * @example
 * ```typescript
 * return this.http.get<Data>(url).pipe(
 *   applyRetry(),
 *   handleApiError('DataService.getData')
 * );
 * ```
 */
export function applyRetry<T>() {
  return (source: Observable<T>) => source.pipe(
    retry(DEFAULT_RETRY_CONFIG)
  );
}

/**
 * Creates a standardized error handler for API calls.
 * 
 * Logs errors to console and re-throws them for component-level handling.
 * 
 * @param context - Context string for error logging (e.g., 'ServiceName.methodName')
 * @returns catchError operator
 * 
 * @example
 * ```typescript
 * return this.http.get<Data>(url).pipe(
 *   applyRetry(),
 *   handleApiError('DataService.getData')
 * );
 * ```
 */
export function handleApiError(context: string) {
  return catchError((error: HttpErrorResponse) => {
    console.error(`${context} error:`, error);
    return throwError(() => error);
  });
}

/**
 * Extracts a user-friendly error message from an HTTP error response.
 * 
 * @param error - The HTTP error response
 * @param defaultMessage - Default message if none can be extracted
 * @returns User-friendly error message
 * 
 * @example
 * ```typescript
 * api.getData().subscribe({
 *   error: (err) => {
 *     this.errorMessage = getErrorMessage(err, 'Failed to load data');
 *   }
 * });
 * ```
 */
export function getErrorMessage(
  error: HttpErrorResponse,
  defaultMessage: string
): string {
  if (error.status === 404) {
    return 'Resource not found';
  }
  if (error.status === 403) {
    return 'Access denied';
  }
  if (error.status === 401) {
    return 'Unauthorized. Please log in again.';
  }
  if (error.error?.message) {
    return error.error.message;
  }
  return defaultMessage;
}

/**
 * Combines retry and error handling into a single operator.
 * 
 * Convenience function that applies both retry logic and error handling.
 * 
 * @param context - Context string for error logging
 * @returns Combined operator
 * 
 * @example
 * ```typescript
 * return this.http.get<Data>(url).pipe(
 *   withRetryAndErrorHandling('DataService.getData')
 * );
 * ```
 */
export function withRetryAndErrorHandling<T>(context: string) {
  return (source: Observable<T>) => source.pipe(
    applyRetry(),
    handleApiError(context)
  );
}
