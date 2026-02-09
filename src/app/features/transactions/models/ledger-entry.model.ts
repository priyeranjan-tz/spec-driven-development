import { SourceType } from './source-type.enum';

/**
 * Ledger entry model representing an immutable financial transaction record.
 * 
 * Ledger entries are system-generated, append-only records that maintain a complete
 * audit trail of all financial activity on an account. Each entry is either a debit
 * (charge/ride) or credit (payment) and maintains a running balance.
 * 
 * @remarks
 * **Ledger Entry Rules:**
 * - Entries are immutable after creation (append-only ledger)
 * - Exactly one of debitAmount or creditAmount must be greater than 0
 * - runningBalance is calculated sequentially based on posting date
 * - sourceReferenceId links to the originating transaction (Ride or Payment)
 * - linkedInvoiceId associates the entry with an invoice (if applicable)
 * - metadata contains additional context (ride details, payment method, etc.)
 * 
 * @example
 * ```typescript
 * // Debit entry (ride charge)
 * const debitEntry: LedgerEntry = {
 *   id: 'entry-123',
 *   accountId: 'account-456',
 *   postingDate: '2026-01-15T14:30:00Z',
 *   sourceType: SourceType.Ride,
 *   sourceReferenceId: 'ride-789',
 *   debitAmount: 2500,     // $25.00 charge
 *   creditAmount: 0,
 *   runningBalance: -2500, // Customer owes $25.00
 *   linkedInvoiceId: 'invoice-001',
 *   metadata: { pickup: '123 Main St', dropoff: '456 Oak Ave' },
 *   createdAt: '2026-01-15T14:30:05Z'
 * };
 * 
 * // Credit entry (payment)
 * const creditEntry: LedgerEntry = {
 *   id: 'entry-124',
 *   accountId: 'account-456',
 *   postingDate: '2026-01-20T10:00:00Z',
 *   sourceType: SourceType.Payment,
 *   sourceReferenceId: 'payment-555',
 *   debitAmount: 0,
 *   creditAmount: 2500,    // $25.00 payment
 *   runningBalance: 0,     // Balance cleared
 *   linkedInvoiceId: null,
 *   metadata: { paymentMethod: 'credit_card' },
 *   createdAt: '2026-01-20T10:00:03Z'
 * };
 * ```
 */
export interface LedgerEntry {
  /**
   * Unique identifier for the ledger entry
   */
  id: string;

  /**
   * Foreign key to the Account this entry belongs to
   */
  accountId: string;

  /**
   * When the transaction was posted (ISO 8601 timestamp)
   */
  postingDate: string;

  /**
   * Type of transaction source (Ride or Payment)
   */
  sourceType: SourceType;

  /**
   * Reference ID for the originating transaction (Ride ID or Payment ID)
   */
  sourceReferenceId: string;

  /**
   * Debit amount in USD cents (positive for charges)
   * Exactly one of debitAmount or creditAmount must be > 0
   */
  debitAmount: number;

  /**
   * Credit amount in USD cents (positive for payments)
   * Exactly one of debitAmount or creditAmount must be > 0
   */
  creditAmount: number;

  /**
   * Account balance in USD cents after this entry is applied
   * Can be negative
   */
  runningBalance: number;

  /**
   * Optional link to an invoice if this entry is part of one
   */
  linkedInvoiceId: string | null;

  /**
   * Additional contextual data (e.g., ride details, payment method)
   */
  metadata: Record<string, unknown>;

  /**
   * When the entry was created in the system (ISO 8601 timestamp)
   */
  createdAt: string;
}
