import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Account } from '../models/account.model';
import { AccountStatus } from '../models/account-status.enum';
import { AccountType } from '../models/account-type.enum';
import { ApiResponse, SingleApiResponse } from '../../../core/models/api-response';
import { API_CONFIG } from '../../../core/constants/app.constants';
import { withRetryAndErrorHandling } from '../../../core/utils/api.util';

/**
 * Service for handling all HTTP requests related to account data.
 * 
 * Provides methods to fetch account lists and individual account details with filtering,
 * pagination, and error handling. Uses automatic retry logic for transient failures.
 * 
 * @remarks
 * All methods automatically include the X-Tenant-ID header via the tenantInterceptor.
 * Requests are retried up to 2 times with a 1-second delay for handling transient failures.
 * 
 * @example
 * ```typescript
 * // Inject service
 * private accountsService = inject(AccountsApiService);
 * 
 * // Get paginated accounts
 * this.accountsService.getAccounts(tenantId, 1, 50).subscribe(response => {
 *   console.log(response.data); // Account array
 *   console.log(response.pagination); // Pagination metadata
 * });
 * 
 * // Get single account
 * this.accountsService.getAccount(tenantId, accountId).subscribe(account => {
 *   console.log(account.name);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class AccountsApiService {
  private http = inject(HttpClient);
  private readonly baseUrl = API_CONFIG.BASE_URL;

  /**
   * Fetches a paginated list of accounts for a tenant.
   * 
   * Supports filtering by account status and type, with automatic retry on failure.
   * Returns paginated results with metadata for building UI pagination controls.
   * 
   * @param tenantId - The UUID of the tenant
   * @param page - Page number (1-indexed, defaults to 1)
   * @param pageSize - Number of items per page (defaults to 50)
   * @param status - Optional filter by account status (Active, Suspended, Closed)
   * @param type - Optional filter by account type (Organization, Individual)
   * @returns Observable of paginated account response
   * 
   * @example
   * ```typescript
   * // Get first page of active accounts
   * getAccounts(tenantId, 1, 50, AccountStatus.Active).subscribe(response => {
   *   this.accounts = response.data;
   *   this.totalPages = response.pagination.totalPages;
   * });
   * 
   * // Get all organization accounts
   * getAccounts(tenantId, 1, 50, undefined, AccountType.Organization);
   * ```
   */
  getAccounts(
    tenantId: string,
    page = 1,
    pageSize = 50,
    status?: AccountStatus,
    type?: AccountType
  ): Observable<ApiResponse<Account>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    if (status) {
      params = params.set('status', status);
    }

    if (type) {
      params = params.set('type', type);
    }

    return this.http.get<ApiResponse<Account>>(
      `${this.baseUrl}/accounts`,
      { params }
    ).pipe(
      withRetryAndErrorHandling('AccountsApiService.getAccounts')
    ) as Observable<ApiResponse<Account>>;
  }

  /**
   * Fetches a single account by ID.
   * 
   * Returns full account details including current balance and last invoice date.
   * Automatically retries the request up to 2 times on failure.
   * 
   * @param tenantId - The UUID of the tenant
   * @param accountId - The UUID of the account to fetch
   * @returns Observable of the account object
   * 
   * @throws HTTP error if account not found (404) or access denied (403)
   * 
   * @example
   * ```typescript
   * getAccount(tenantId, accountId).subscribe({
   *   next: (account) => {
   *     console.log(`Balance: ${account.currentBalance}`);
   *   },
   *   error: (err) => {
   *     if (err.status === 404) {
   *       console.error('Account not found');
   *     }
   *   }
   * });
   * ```
   */
  getAccount(tenantId: string, accountId: string): Observable<Account> {
    return this.http.get<any>(
      `${this.baseUrl}/accounts/${accountId}`
    ).pipe(
      map(response => response.data || response),
      withRetryAndErrorHandling('AccountsApiService.getAccount')
    ) as Observable<Account>;
  }
}