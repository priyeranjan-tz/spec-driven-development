/**
 * Enumeration of invoice generation frequencies.
 * 
 * Defines how often invoices are automatically generated for an account.
 * The frequency determines the billing period and when invoices are created.
 * 
 * @remarks
 * - PerRide: Immediate invoice after each ride (for high-value customers)
 * - Daily: Single invoice per day covering all rides that day
 * - Weekly: Invoice every 7 days covering rides in that week
 * - Monthly: Invoice once per month covering rides in that month
 * 
 * @example
 * ```typescript
 * // Set account to monthly billing
 * const account = {
 *   frequency: InvoiceFrequency.Monthly,
 *   ...
 * };
 * 
 * // Filter for monthly invoices
 * invoicesService.getInvoices(
 *   tenantId,
 *   accountId,
 *   1,
 *   50,
 *   undefined,
 *   InvoiceFrequency.Monthly
 * );
 * 
 * // Display frequency in UI
 * const displayName = {
 *   [InvoiceFrequency.PerRide]: 'Per Ride',
 *   [InvoiceFrequency.Daily]: 'Daily',
 *   [InvoiceFrequency.Weekly]: 'Weekly',
 *   [InvoiceFrequency.Monthly]: 'Monthly'
 * }[invoice.frequency];
 * ```
 */
export enum InvoiceFrequency {
  /** Per-ride invoicing - generated after each ride */
  PerRide = 'PerRide',
  
  /** Daily invoicing - generated once per day */
  Daily = 'Daily',
  
  /** Weekly invoicing - generated once per week */
  Weekly = 'Weekly',
  
  /** Monthly invoicing - generated once per month */
  Monthly = 'Monthly'
}
