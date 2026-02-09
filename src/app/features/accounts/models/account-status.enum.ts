/**
 * Enumeration of account statuses indicating the operational state.
 * 
 * Controls whether new transactions can be recorded against the account.
 * - Active: Normal operations, can create invoices and record transactions
 * - Suspended: Temporarily disabled, no new transactions allowed
 * - Closed: Permanently closed, no new transactions allowed
 * 
 * @example
 * ```typescript
 * // Check if account can be billed
 * if (account.status === AccountStatus.Active) {
 *   // Create new invoice
 * } else {
 *   // Show account suspended/closed message
 * }
 * 
 * // Filter for active accounts only
 * accountsService.getAccounts(tenantId, 1, 50, AccountStatus.Active);
 * ```
 */
export enum AccountStatus {
  Active = 'active',
  Suspended = 'suspended',
  Closed = 'closed'
}
