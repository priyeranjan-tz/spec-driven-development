import { AccountType } from './account-type.enum';
import { AccountStatus } from './account-status.enum';

/**
 * Account model representing a financially responsible entity within a tenant.
 * 
 * Accounts are the primary billing entities in the system. Each account can have multiple
 * invoices and ledger entries. The currentBalance represents the running balance including
 * all charges (rides) and payments.
 * 
 * @remarks
 * - Accounts are isolated by tenant (multi-tenancy)
 * - Balance can be negative (indicating customer owes money)
 * - Balance can be positive (indicating customer has credit)
 * - lastInvoiceDate is null for accounts with no invoices yet
 * 
 * @example
 * ```typescript
 * const account: Account = {
 *   id: 'account-123',
 *   tenantId: 'tenant-456',
 *   name: 'General Hospital',
 *   type: AccountType.Organization,
 *   currentBalance: -15000, // Owes $150.00
 *   lastInvoiceDate: '2026-01-31T00:00:00Z',
 *   status: AccountStatus.Active,
 *   createdAt: '2026-01-01T00:00:00Z',
 *   updatedAt: '2026-02-01T00:00:00Z'
 * };
 * ```
 */
export interface Account {
  /** Unique identifier (UUID) */
  id: string;
  /** Foreign key to Tenant */
  tenantId: string;
  /** Account name (e.g., "General Hospital", "John Doe") */
  name: string;
  /** Account type */
  type: AccountType;
  /** Current balance in USD cents (can be negative) */
  currentBalance: number;
  /** ISO 8601 date string of last invoice, or null if no invoices */
  lastInvoiceDate: string | null;
  /** Account status */
  status: AccountStatus;
  /** ISO 8601 timestamp of creation */
  createdAt: string;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
}
