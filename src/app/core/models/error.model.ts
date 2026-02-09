/**
 * Standard API error response structure returned by backend services.
 * 
 * Provides consistent error information across all API endpoints, including
 * error codes, messages, and correlation IDs for debugging.
 * 
 * @example
 * ```typescript
 * // Typical error response from backend
 * {
 *   code: 'VALIDATION_ERROR',
 *   message: 'Invoice number is required',
 *   details: { field: 'invoiceNumber' },
 *   correlationId: '550e8400-e29b-41d4-a716-446655440000',
 *   timestamp: '2026-02-06T10:30:00Z'
 * }
 * ```
 */
export interface ApiError {
  /** Error code */
  code: string;
  /** Human-readable error message */
  message: string;
  /** Additional error details */
  details?: Record<string, unknown>;
  /** Request correlation ID for tracing */
  correlationId?: string;
  /** Timestamp of the error */
  timestamp?: string;
}

/**
 * Enumeration of error types for client-side error classification and handling.
 * 
 * Maps backend error states to client-side error categories, enabling appropriate
 * UI feedback and retry logic based on error type.
 * 
 * @example
 * ```typescript
 * switch (error.type) {
 *   case ErrorType.Network:
 *     // Show offline message
 *     break;
 *   case ErrorType.Unauthorized:
 *     // Redirect to login
 *     break;
 *   case ErrorType.Validation:
 *     // Show field errors
 *     break;
 * }
 * ```
 */
export enum ErrorType {
  /** Network connectivity error (offline) */
  Network = 'NETWORK_ERROR',
  /** Authentication required (401) */
  Unauthorized = 'UNAUTHORIZED',
  /** Permission denied (403) */
  Forbidden = 'FORBIDDEN',
  /** Resource not found (404) */
  NotFound = 'NOT_FOUND',
  /** Validation error (400) */
  Validation = 'VALIDATION_ERROR',
  /** Server error (500) */
  Server = 'SERVER_ERROR',
  /** Unknown/unexpected error */
  Unknown = 'UNKNOWN_ERROR'
}

/**
 * Client-side error object with type classification and retry information.
 * 
 * Enhanced error object used throughout the application to provide consistent
 * error handling and user feedback. Includes information about whether the
 * operation should be retried.
 * 
 * @example
 * ```typescript
 * const error: ClientError = {
 *   type: ErrorType.Network,
 *   message: 'Unable to connect to server',
 *   statusCode: 0,
 *   retryable: true
 * };
 * 
 * if (error.retryable) {
 *   // Show retry button
 * }
 * ```
 */
export interface ClientError {
  /** Error type for UI handling */
  type: ErrorType;
  /** Original error message */
  message: string;
  /** HTTP status code if applicable */
  statusCode?: number;
  /** Original API error if available */
  apiError?: ApiError;
  /** Whether this error should be retryable */
  retryable: boolean;
}
