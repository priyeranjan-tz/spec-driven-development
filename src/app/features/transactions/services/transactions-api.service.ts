import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, retry, catchError } from 'rxjs/operators';
import { LedgerEntry } from '../models/ledger-entry.model';
import { SourceType } from '../models/source-type.enum';
import { ApiResponse, SingleApiResponse } from '../../../core/models/api-response';
import { API_CONFIG } from '../../../core/constants/app.constants';
import { withRetryAndErrorHandling } from '../../../core/utils/api.util';

/**
 * Service for handling all HTTP requests related to ledger entry (transaction) data.
 * 
 * Provides methods to fetch ledger entries with advanced filtering by date range,
 * source type, and linked invoices. Ledger entries represent immutable financial
 * transactions (debits and credits) on accounts.
 * 
 * @remarks
 * - Ledger entries are immutable system-generated records
 * - Each entry contains either a debit (charge) or credit (payment) amount
 * - Running balance is maintained for each entry
 * - Entries can be linked to invoices via linkedInvoiceId
 * - All requests include automatic retry logic (2 attempts with 1s delay)
 * 
 * @example
 * ```typescript
 * // Inject service
 * private transactionsService = inject(TransactionsApiService);
 * 
 * // Get ledger entries with filters
 * this.transactionsService.getLedgerEntries(
 *   tenantId,
 *   accountId,
 *   1,
 *   50,
 *   '2026-01-01',
 *   '2026-01-31',
 *   SourceType.Ride
 * ).subscribe(response => {
 *   this.entries = response.data;
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TransactionsApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.BASE_URL;

  /**
   * Fetches a paginated list of ledger entries for an account.
   * 
   * Supports comprehensive filtering by date range, source type (Ride or Payment),
   * and linked invoice. Useful for transaction history views, account reconciliation,
   * and audit trails.
   * 
   * @param tenantId - The UUID of the tenant
   * @param accountId - The UUID of the account
   * @param page - Page number (1-indexed, defaults to 1)
   * @param pageSize - Number of items per page (defaults to 50)
   * @param startDate - Optional start date filter (ISO 8601 date string, e.g., "2026-01-01")
   * @param endDate - Optional end date filter (ISO 8601 date string, e.g., "2026-01-31")
   * @param sourceType - Optional filter by transaction source (SourceType.Ride or SourceType.Payment)
   * @param linkedInvoiceId - Optional filter to show only entries linked to a specific invoice
   * @returns Observable of paginated ledger entry response
   * 
   * @example
   * ```typescript
   * // Get all entries for January 2026
   * getLedgerEntries(
   *   tenantId,
   *   accountId,
   *   1,
   *   50,
   *   '2026-01-01',
   *   '2026-01-31'
   * ).subscribe(response => {
   *   this.entries = response.data;
   * });
   * 
   * // Get only ride charges
   * getLedgerEntries(
   *   tenantId,
   *   accountId,
   *   1,
   *   50,
   *   undefined,
   *   undefined,
   *   SourceType.Ride
   * );
   * 
   * // Get entries for a specific invoice
   * getLedgerEntries(
   *   tenantId,
   *   accountId,
   *   1,
   *   50,
   *   undefined,
   *   undefined,
   *   undefined,
   *   invoiceId
   * );
   * ```
   */
  getLedgerEntries(
    tenantId: string,
    accountId: string,
    page = 1,
    pageSize = 50,
    startDate?: string,
    endDate?: string,
    sourceType?: SourceType,
    linkedInvoiceId?: string
  ): Observable<ApiResponse<LedgerEntry>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());
      
    if (startDate) {
      params = params.set('startDate', startDate);
    }

    if (endDate) {
      params = params.set('endDate', endDate);
    }

    if (sourceType) {
      params = params.set('sourceType', sourceType);
    }

    if (linkedInvoiceId) {
      params = params.set('linkedInvoiceId', linkedInvoiceId);
    }

    return this.http.get<ApiResponse<LedgerEntry>>(
      `${this.baseUrl}/accounts/${accountId}/statements`,
      { params }
    ).pipe(
      withRetryAndErrorHandling('TransactionsApiService.getLedgerEntries')
    ) as Observable<ApiResponse<LedgerEntry>>;
  }

  /**
   * Fetches a single ledger entry by ID.
   * 
   * Returns complete details of a specific ledger entry including amounts, balance,
   * source reference, and metadata. Useful for transaction detail views.
   * 
   * @param tenantId - The UUID of the tenant
   * @param accountId - The UUID of the account
   * @param ledgerEntryId - The UUID of the ledger entry to fetch
   * @returns Observable of the ledger entry object
   * 
   * @throws HTTP error if entry not found (404) or access denied (403)
   * 
   * @example
   * ```typescript
   * getLedgerEntry(tenantId, accountId, entryId).subscribe({
   *   next: (entry) => {
   *     console.log(`Type: ${entry.sourceType}`);
   *     console.log(`Amount: ${entry.debitAmount || entry.creditAmount}`);
   *     console.log(`Balance: ${entry.runningBalance}`);
   *   },
   *   error: (err) => {
   *     console.error('Failed to load entry:', err.message);
   *   }
 * });
   * ```
   */
  getLedgerEntry(
    tenantId: string,
    accountId: string,
    ledgerEntryId: string
  ): Observable<LedgerEntry> {
    
    return this.http.get<SingleApiResponse<LedgerEntry>>(
      `${this.baseUrl}/accounts/${accountId}/ledger/${ledgerEntryId}`
    ).pipe(
      map(response => response.data),
      withRetryAndErrorHandling('TransactionsApiService.getLedgerEntry')
    ) as Observable<LedgerEntry>;
  }
}