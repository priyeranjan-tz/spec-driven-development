import { InvoiceFrequency } from './invoice-frequency.enum';
import { InvoiceStatus } from './invoice-status.enum';
import { InvoiceLineItem } from './invoice-line-item.model';

/**
 * Invoice model representing a billing invoice for an account.
 * 
 * Invoices contain line items (rides/charges) for a specific billing period and track
 * the payment lifecycle from draft to paid. Financial fields are immutable once issued.
 * 
 * @remarks
 * **Business Rules:**
 * - totalCents = subtotalCents + taxCents (enforced by backend)
 * - issuedAt must be set when status changes to 'Issued'
 * - paidAt must be set when status changes to 'Paid'
 * - billingPeriodEnd must be after billingPeriodStart
 * - dueDate should be after issuedAt
 * - Financial fields (amounts, line items) are immutable after issuance
 * - Only metadata fields (notes, internalReference, billingContact) can be updated
 * 
 * @example
 * ```typescript
 * const invoice: Invoice = {
 *   id: 'invoice-123',
 *   accountId: 'account-456',
 *   invoiceNumber: 'INV-2026-001',
 *   billingPeriodStart: '2026-01-01',
 *   billingPeriodEnd: '2026-01-31',
 *   frequency: InvoiceFrequency.Monthly,
 *   subtotalCents: 50000, // $500.00
 *   taxCents: 4000,       // $40.00
 *   totalCents: 54000,    // $540.00
 *   status: InvoiceStatus.Issued,
 *   dueDate: '2026-02-15',
 *   issuedAt: '2026-02-01T00:00:00Z',
 *   paidAt: null,
 *   createdAt: '2026-02-01T00:00:00Z',
 *   lineItems: [
 *     { id: '1', rideId: 'ride-1', fareCents: 25000, ... },
 *     { id: '2', rideId: 'ride-2', fareCents: 25000, ... }
 *   ]
 * };
 * ```
 */
export interface Invoice {
  /** Unique identifier (UUID) */
  id: string;
  
  /** Foreign key to Account (UUID) */
  accountId: string;
  
  /** Human-readable invoice number (e.g., "INV-2026-001") */
  invoiceNumber: string;
  
  /** Start date of the billing period (ISO 8601 date string) */
  billingPeriodStart: string;
  
  /** End date of the billing period (ISO 8601 date string) */
  billingPeriodEnd: string;
  
  /** Frequency of invoice generation */
  frequency: InvoiceFrequency;
  
  /** Subtotal amount in cents (before tax) */
  subtotalCents: number;
  
  /** Tax amount in cents */
  taxCents: number;
  
  /** Total amount in cents (subtotal + tax) */
  totalCents: number;
  
  /** Current status of the invoice */
  status: InvoiceStatus;
  
  /** Due date for payment (ISO 8601 date string) */
  dueDate: string;
  
  /** Timestamp when invoice was issued (ISO 8601) */
  issuedAt: string | null;
  
  /** Timestamp when invoice was paid (ISO 8601) */
  paidAt?: string | null;
  
  /** Timestamp when record was created (ISO 8601) */
  createdAt: string;
  
  /** Timestamp when record was last updated (ISO 8601) */
  updatedAt?: string;
  
  /** Array of line items (rides/charges) included in this invoice */
  lineItems: InvoiceLineItem[];
}
