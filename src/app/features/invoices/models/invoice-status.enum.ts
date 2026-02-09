/**
 * Enumeration of invoice statuses representing the invoice lifecycle.
 * 
 * Tracks the progression of an invoice from creation through payment or cancellation.
 * Status transitions follow a specific flow: Draft → Issued → Paid/Overdue/Cancelled.
 * 
 * @remarks
 * **Status Transitions:**
 * - Draft: Initial state, invoice can still be modified
 * - Issued: Sent to customer, financial fields locked
 * - Paid: Payment received in full
 * - Overdue: Past due date without payment
 * - Cancelled: Voided, no payment expected
 * 
 * @example
 * ```typescript
 * // Check if invoice is payable
 * if (invoice.status === InvoiceStatus.Issued || invoice.status === InvoiceStatus.Overdue) {
 *   // Show payment button
 * }
 * 
 * // Filter for unpaid invoices
 * if ([InvoiceStatus.Issued, InvoiceStatus.Overdue].includes(invoice.status)) {
 *   unpaidInvoices.push(invoice);
 * }
 * 
 * // Display status badge color
 * const color = invoice.status === InvoiceStatus.Paid ? 'green' :
 *               invoice.status === InvoiceStatus.Overdue ? 'red' : 'yellow';
 * ```
 */
export enum InvoiceStatus {
  /** Draft - Invoice created but not yet issued */
  Draft = 'Draft',
  
  /** Issued - Invoice has been sent to the customer */
  Issued = 'Issued',
  
  /** Paid - Invoice has been paid in full */
  Paid = 'Paid',
  
  /** Overdue - Invoice payment is past the due date */
  Overdue = 'Overdue',
  
  /** Cancelled - Invoice has been cancelled and is void */
  Cancelled = 'Cancelled'
}
