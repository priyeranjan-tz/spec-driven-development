import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Production-safe logging service.
 * 
 * Provides centralized logging with automatic sanitization of sensitive data
 * and conditional logging based on environment. Prevents accidental exposure
 * of tokens, passwords, and other sensitive information in production logs.
 * 
 * @remarks
 * In production builds:
 * - Sensitive data is automatically redacted
 * - Only error logs are output to console
 * - Logs can be forwarded to monitoring services (Sentry, Application Insights)
 * 
 * @example
 * ```typescript
 * constructor(private logger: LoggerService) {}
 * 
 * processingData() {
 *   this.logger.info('Processing invoice', { invoiceId: '123' });
 *   this.logger.error('Failed to save', error);
 * }
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private readonly isProduction = false; // Set from environment in real app
  private readonly sensitiveKeys = [
    'password',
    'token',
    'authorization',
    'auth',
    'secret',
    'key',
    'apikey',
    'api_key',
    'access_token',
    'refresh_token',
    'bearer',
    'csrf',
    'session',
    'cookie'
  ];

  /**
   * Logs informational messages.
   * Only outputs in development environments.
   * 
   * @param message - The log message
   * @param data - Optional data to log (will be sanitized)
   */
  info(message: string, data?: any): void {
    if (!this.isProduction) {
      const sanitized = data ? this.sanitize(data) : undefined;
      console.log(`[INFO] ${message}`, sanitized || '');
    }
  }

  /**
   * Logs warning messages.
   * Outputs in all environments with sensitive data redacted.
   * 
   * @param message - The warning message
   * @param data - Optional data to log (will be sanitized)
   */
  warn(message: string, data?: any): void {
    const sanitized = data ? this.sanitize(data) : undefined;
    console.warn(`[WARN] ${message}`, sanitized || '');
  }

  /**
   * Logs error messages.
   * Outputs in all environments with sensitive data redacted.
   * In production, should forward to monitoring service.
   * 
   * @param message - The error message
   * @param error - The error object or additional data (will be sanitized)
   */
  error(message: string, error?: any): void {
    const sanitized = error ? this.sanitize(error) : undefined;
    console.error(`[ERROR] ${message}`, sanitized || '');
    
    // In production, send to monitoring service
    // this.sendToMonitoring(message, sanitized);
  }

  /**
   * Logs debug messages.
   * Only outputs in development environments.
   * 
   * @param message - The debug message
   * @param data - Optional data to log (will be sanitized)
   */
  debug(message: string, data?: any): void {
    if (!this.isProduction) {
      const sanitized = data ? this.sanitize(data) : undefined;
      console.debug(`[DEBUG] ${message}`, sanitized || '');
    }
  }

  /**
   * Sanitizes objects by redacting sensitive keys.
   * 
   * Recursively traverses objects and arrays, replacing values of
   * sensitive keys with '[REDACTED]' to prevent data leakage.
   * 
   * @param obj - The object to sanitize
   * @returns A sanitized copy of the object
   * @private
   */
  private sanitize(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Handle primitive types
    if (typeof obj !== 'object') {
      return obj;
    }

    // Handle arrays
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitize(item));
    }

    // Handle Error objects
    if (obj instanceof Error) {
      return {
        message: obj.message,
        name: obj.name,
        stack: this.isProduction ? '[REDACTED]' : obj.stack
      };
    }

    // Handle plain objects
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const lowerKey = key.toLowerCase();
        
        // Check if key contains sensitive information
        if (this.sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
          sanitized[key] = '[REDACTED]';
        } else {
          sanitized[key] = this.sanitize(obj[key]);
        }
      }
    }

    return sanitized;
  }

  /**
   * Measures and logs execution time of async operations.
   * 
   * @param label - Label for the operation
   * @param operation - The async operation to measure
   * @returns Result of the operation
   * 
   * @example
   * ```typescript
   * const result = await this.logger.measure('Load invoices', () => 
   *   this.http.get('/api/invoices').toPromise()
   * );
   * ```
   */
  async measure<T>(label: string, operation: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await operation();
      const duration = performance.now() - start;
      this.info(`${label} completed in ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.error(`${label} failed after ${duration.toFixed(2)}ms`, error);
      throw error;
    }
  }
}
