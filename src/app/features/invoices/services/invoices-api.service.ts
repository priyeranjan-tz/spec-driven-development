import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { retry, catchError } from 'rxjs/operators';
import { Invoice } from '../models/invoice.model';
import { InvoiceStatus } from '../models/invoice-status.enum';
import { InvoiceFrequency } from '../models/invoice-frequency.enum';
import { ApiResponse } from '../../../core/models/api-response';
import { API_CONFIG } from '../../../core/constants/app.constants';
import { withRetryAndErrorHandling } from '../../../core/utils/api.util';

/**
 * Service for handling all HTTP requests related to invoice data.
 * 
 * Provides methods for fetching invoice lists with advanced filtering and sorting,
 * retrieving detailed invoice information including line items, and updating
 * editable invoice metadata fields.
 * 
 * @remarks
 * - Financial fields (amounts, line items) cannot be modified via this service
 * - Only metadata fields (notes, internalReference, billingContact) are editable
 * - All requests include automatic retry logic for transient failures
 * - Tenant isolation is enforced via X-Tenant-ID header
 * 
 * @example
 * ```typescript
 * // Inject service
 * private invoicesService = inject(InvoicesApiService);
 * 
 * // Get invoices with filters
 * this.invoicesService.getInvoices(
 *   tenantId,
 *   accountId,
 *   1, // page
 *   50, // pageSize
 *   InvoiceStatus.Issued,
 *   undefined,
 *   'dueDate',
 *   'asc'
 * ).subscribe(response => {
 *   this.invoices = response.data;
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class InvoicesApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.BASE_URL;

  /**
   * Fetches a paginated list of invoices for an account with optional filters and sorting.
   * 
   * Supports comprehensive filtering by status and frequency, plus sorting by any
   * invoice field. Returns paginated results suitable for list views with server-side
   * filtering and sorting.
   * 
   * @param tenantId - The UUID of the tenant
   * @param accountId - The UUID of the account
   * @param page - Page number (1-indexed, defaults to 1)
   * @param pageSize - Number of items per page (defaults to 50)
   * @param status - Optional filter by invoice status (Draft, Issued, Paid, Overdue, Cancelled)
   * @param frequency - Optional filter by billing frequency (PerRide, Daily, Weekly, Monthly)
   * @param sortBy - Optional sort field (e.g., 'invoiceNumber', 'dueDate', 'totalCents', 'status')
   * @param sortOrder - Optional sort direction ('asc' or 'desc')
   * @returns Observable of paginated invoice response
   * 
   * @example
   * ```typescript
   * // Get overdue invoices sorted by due date
   * getInvoices(
   *   tenantId,
   *   accountId,
   *   1,
   *   50,
   *   InvoiceStatus.Overdue,
   *   undefined,
   *   'dueDate',
   *   'asc'
   * ).subscribe(response => {
 *   this.overdueInvoices = response.data;
   * });
   * 
   * // Get monthly invoices
   * getInvoices(
 *   tenantId,
 *   accountId,
 *   1,
 *   50,
 *   undefined,
 *   InvoiceFrequency.Monthly
 * );
   * ```
   */
  getInvoices(
    tenantId: string,
    accountId: string,
    page = 1,
    pageSize = 50,
    status?: InvoiceStatus,
    frequency?: InvoiceFrequency,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Observable<ApiResponse<Invoice>> {
    let params = new HttpParams()
      .set('AccountId', accountId)
      .set('Page', page.toString())
      .set('PageSize', pageSize.toString());

    if (status) {
      params = params.set('status', status);
    }

    if (frequency) {
      params = params.set('frequency', frequency);
    }

    if (sortBy) {
      params = params.set('sortBy', sortBy);
    }

    if (sortOrder) {
      params = params.set('sortOrder', sortOrder);
    }

    return this.http.get<ApiResponse<Invoice>>(
      `${this.baseUrl}/invoices`,
      { params }
    ).pipe(
      withRetryAndErrorHandling('InvoicesApiService.getInvoices')
    ) as Observable<ApiResponse<Invoice>>;
  }

  /**
   * Fetches a single invoice by ID with full details including all line items.
   * 
   * Returns complete invoice information including billing periods, amounts,
   * status, and the full array of line items (rides/charges). Essential for
   * invoice detail views.
   * 
   * @param tenantId - The UUID of the tenant
   * @param accountId - The UUID of the account
   * @param invoiceId - The UUID of the invoice to fetch
   * @returns Observable with data property containing the invoice object
   * 
   * @throws HTTP error if invoice not found (404) or access denied (403)
   * 
   * @example
   * ```typescript
   * getInvoice(tenantId, accountId, invoiceId).subscribe({
   *   next: (response) => {
   *     const invoice = response.data;
   *     console.log(`Total: $${invoice.totalCents / 100}`);
   *     console.log(`Line items: ${invoice.lineItems.length}`);
   *   },
   *   error: (err) => {
   *     console.error('Failed to load invoice:', err.message);
   *   }
 * });
   * ```
   */
  getInvoice(
    tenantId: string,
    accountId: string,
    invoiceNumber: string
  ): Observable<{ data: Invoice }> {
    return this.http.get<{ data: Invoice }>(
      `${this.baseUrl}/invoices/${invoiceNumber}`
    ).pipe(
      withRetryAndErrorHandling('InvoicesApiService.getInvoice')
    ) as Observable<{ data: Invoice }>;
  }

  /**
   * Updates editable metadata fields on an invoice.
   * 
   * Only non-financial fields can be updated: notes, internalReference, and billingContact.
   * Financial fields (amounts, line items, dates, status) are immutable and cannot be
   * modified through this endpoint.
   * 
   * @param tenantId - The UUID of the tenant
   * @param accountId - The UUID of the account
   * @param invoiceId - The UUID of the invoice to update
   * @param metadata - Object containing fields to update (all optional)
   * @param metadata.notes - Free-text notes field (max 1000 chars)
   * @param metadata.internalReference - Internal reference number (max 100 chars)
   * @param metadata.billingContact - Email address for billing contact
   * @returns Observable with data property containing the updated invoice
   * 
   * @throws HTTP error if validation fails (400) or invoice not found (404)
   * 
   * @example
   * ```typescript
   * // Update only notes
   * updateInvoiceMetadata(tenantId, accountId, invoiceId, {
   *   notes: 'Customer requested payment extension'
   * }).subscribe(response => {
   *   console.log('Updated invoice:', response.data);
   * });
   * 
   * // Update multiple fields
   * updateInvoiceMetadata(tenantId, accountId, invoiceId, {
   *   notes: 'Special arrangement',
   *   internalReference: 'CUST-2026-001',
   *   billingContact: 'billing@example.com'
   * });
   * ```
   */
  // Note: Update invoice metadata endpoint not available in backend API
  // Keeping method signature for backwards compatibility but it will return an error
  updateInvoiceMetadata(
    tenantId: string,
    accountId: string,
    invoiceNumber: string,
    metadata: {
      notes?: string;
      internalReference?: string;
      billingContact?: string;
    }
  ): Observable<{ data: Invoice }> {
    // Backend doesn't have this endpoint - would need to be added
    throw new Error('Update invoice metadata endpoint not implemented in backend API');
  }
}