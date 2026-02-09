import { STATUS_CLASSES } from '../constants/app.constants';

/**
 * Utility functions for handling status display and styling.
 */

/**
 * Gets the CSS classes for an invoice status badge.
 * 
 * @param status - The invoice status string
 * @returns Tailwind CSS classes for styling the status badge
 * 
 * @example
 * ```typescript
 * const classes = getInvoiceStatusClass('Paid');
 * // Returns: 'bg-green-100 text-green-800'
 * ```
 */
export function getInvoiceStatusClass(status: string): string {
  const statusMap: Record<string, string> = {
    'Draft': STATUS_CLASSES.INVOICE_DRAFT,
    'Issued': STATUS_CLASSES.INVOICE_ISSUED,
    'Paid': STATUS_CLASSES.INVOICE_PAID,
    'Overdue': STATUS_CLASSES.INVOICE_OVERDUE,
    'Cancelled': STATUS_CLASSES.INVOICE_CANCELLED
  };
  return statusMap[status] || STATUS_CLASSES.DEFAULT;
}

/**
 * Gets the CSS classes for an account status badge.
 * 
 * @param status - The account status string
 * @returns Tailwind CSS classes for styling the status badge
 * 
 * @example
 * ```typescript
 * const classes = getAccountStatusClass('Active');
 * // Returns: 'bg-green-100 text-green-800'
 * ```
 */
export function getAccountStatusClass(status: string): string {
  const statusMap: Record<string, string> = {
    'Active': STATUS_CLASSES.ACCOUNT_ACTIVE,
    'Suspended': STATUS_CLASSES.ACCOUNT_SUSPENDED,
    'Closed': STATUS_CLASSES.ACCOUNT_CLOSED
  };
  return statusMap[status] || STATUS_CLASSES.DEFAULT;
}
