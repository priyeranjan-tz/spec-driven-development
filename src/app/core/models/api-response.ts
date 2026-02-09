/**
 * Standard API response wrapper for paginated list endpoints.
 * 
 * All list endpoints return data in this format, providing both the data array
 * and pagination metadata needed for building paginated UI components.
 * 
 * @typeParam T - The type of items in the data array
 * 
 * @example
 * ```typescript
 * // Response from GET /api/tenants/{tenantId}/accounts
 * const response: ApiResponse<Account> = {
 *   data: [
 *     { id: '1', name: 'Account 1', ... },
 *     { id: '2', name: 'Account 2', ... }
 *   ],
 *   pagination: {
 *     page: 1,
 *     pageSize: 50,
 *     totalItems: 150,
 *     totalPages: 3,
 *     hasNext: true,
 *     hasPrevious: false
 *   }
 * };
 * ```
 */
export interface ApiResponse<T> {
  /** Response data */
  data: T[];
  /** Pagination metadata */
  pagination: PaginationMetadata;
}

/**
 * Pagination metadata included in all paginated API responses.
 * 
 * Provides comprehensive pagination state for building navigation controls,
 * including page numbers, totals, and next/previous flags.
 * 
 * @example
 * ```typescript
 * const { page, totalPages, hasNext } = response.pagination;
 * 
 * // Build page navigation
 * if (hasNext) {
 *   loadPage(page + 1);
 * }
 * 
 * // Show pagination info
 * console.log(`Page ${page} of ${totalPages}`);
 * ```
 */
export interface PaginationMetadata {
  /** Current page number (1-indexed) */
  page: number;
  /** Items per page */
  pageSize: number;
  /** Total number of items across all pages */
  totalItems: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether there is a next page */
  hasNext: boolean;
  /** Whether there is a previous page */
  hasPrevious: boolean;
}

/**
 * API response wrapper for single item endpoints.
 * 
 * Used for endpoints that return a single resource (GET /resource/{id}).
 * Wraps the data in a consistent structure matching the backend format.
 * 
 * @typeParam T - The type of the data object
 * 
 * @example
 * ```typescript
 * // Response from GET /api/tenants/{tenantId}/accounts/{accountId}
 * const response: SingleApiResponse<Account> = {
 *   data: {
 *     id: 'account-123',
 *     name: 'Acme Corp',
 *     currentBalance: 15000,
 *     ...
 *   }
 * };
 * 
 * // Access the account
 * const account = response.data;
 * ```
 */
export interface SingleApiResponse<T> {
  /** Response data */
  data: T;
}
