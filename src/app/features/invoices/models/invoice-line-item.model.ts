/**
 * Represents a single line item within an invoice.
 * 
 * Each line item corresponds to a billable ride or charge. Line items are immutable
 * once the invoice is issued and provide the detailed breakdown of charges.
 * 
 * @remarks
 * - Line items are created automatically when invoices are generated
 * - Each line item references a specific ride via rideId
 * - The sum of all fareCents should equal the invoice subtotalCents
 * - Line items cannot be manually added or removed after invoice creation
 * 
 * @example
 * ```typescript
 * const lineItem: InvoiceLineItem = {
 *   id: 'line-item-1',
 *   rideId: 'ride-123',
 *   rideDate: '2026-01-15T14:30:00Z',
 *   fareCents: 2500, // $25.00
 *   description: 'Pickup: 123 Main St | Dropoff: 456 Oak Ave'
 * };
 * 
 * // Display in UI
 * console.log(`${lineItem.description}: ${lineItem.fareCents / 100}`);
 * ```
 */
export interface InvoiceLineItem {
  /**
   * Unique identifier for the line item.
   */
  id: string;

  /**
   * Reference to the specific ride that generated this charge.
   */
  rideId: string;

  /**
   * Date and time when the ride occurred.
   */
  rideDate: string;

  /**
   * Fare amount in cents for this ride.
   */
  fareCents: number;

  /**
   * Human-readable description of the line item (e.g., "Pickup: 123 Main St | Dropoff: 456 Oak Ave").
   */
  description: string;
}
