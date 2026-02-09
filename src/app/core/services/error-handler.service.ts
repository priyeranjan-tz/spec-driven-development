import { ErrorHandler, Injectable, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LoggerService } from './logger.service';

/**
 * Global error handler for unhandled exceptions.
 * 
 * Implements Angular's ErrorHandler interface to provide centralized error logging
 * and user feedback across the application. Distinguishes between HTTP errors from
 * backend API calls and client-side JavaScript errors.
 * 
 * @remarks
 * This service should be provided at the application root level in app.config.ts.
 * In production, errors should be sent to a monitoring service (e.g., Sentry, Application Insights).
 * 
 * @example
 * ```typescript
 * // In app.config.ts
 * providers: [
 *   { provide: ErrorHandler, useClass: GlobalErrorHandler }
 * ]
 * ```
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private readonly logger = inject(LoggerService);
  
  /**
   * Handles any uncaught error in the application.
   * 
   * Routes the error to the appropriate handler based on error type:
   * - HttpErrorResponse → handleHttpError()
   * - Error → handleClientError()
   * 
   * @param error - The error to handle (either HTTP or client-side)
   * 
   * @example
   * ```typescript
   * throw new Error('Something went wrong'); // Caught by this handler
   * ```
   */
  handleError(error: Error | HttpErrorResponse): void {
    if (error instanceof HttpErrorResponse) {
      // HTTP error from backend
      this.handleHttpError(error);
    } else {
      // Client-side error
      this.handleClientError(error);
    }
  }

  /**
   * Handles HTTP errors received from backend API calls.
   * 
   * Logs detailed error information including status code, message, URL, and timestamp.
   * In production environments, this should forward errors to a monitoring service.
   * 
   * @param error - The HTTP error response from the backend
   * @private
   */
  private handleHttpError(error: HttpErrorResponse): void {
    this.logger.error('HTTP Error detected by GlobalErrorHandler', {
      status: error.status,
      message: error.message,
      url: error.url,
      timestamp: new Date().toISOString()
    });

    // In production, send to monitoring service (e.g., Sentry, Application Insights)
    // this.monitoringService.logError(error);
  }

  /**
   * Handles client-side JavaScript errors and unhandled promise rejections.
   * 
   * Logs error message and stack trace with timestamp. Prevents page crashes by
   * catching errors gracefully. In production, these should be sent to monitoring.
   * 
   * @param error - The client-side error object
   * @private
   */
  private handleClientError(error: Error): void {
    this.logger.error('Client-side error detected by GlobalErrorHandler', {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });

    // In production, send to monitoring service
    // this.monitoringService.logError(error);

    // Prevent page crash by catching the error
    // Angular will show a user-friendly error boundary
  }
}
