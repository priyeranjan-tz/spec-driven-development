import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AccountsApiService } from '../../services/accounts-api.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { Account } from '../../models/account.model';
import { AccountStatus } from '../../models/account-status.enum';
import { AccountType } from '../../models/account-type.enum';
import { AccountCardComponent } from '../../components/account-card/account-card.component';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { FilterBarComponent } from '../../../../shared/components/filter-bar/filter-bar.component';
import { createPaginationState, updatePaginationFromResponse, resetToFirstPage } from '../../../../core/utils/pagination.util';
import { createLoadingState, setLoading, setError } from '../../../../core/utils/loading-state.util';

/**
 * Account list page component displaying paginated accounts with filtering.
 * 
 * Main entry point for viewing all accounts within a tenant. Supports pagination,
 * filtering by status and type, and navigation to account details.
 * 
 * @remarks
 * - Uses signals for reactive state management
 * - Uses OnPush change detection for performance
 * - Automatically loads data on initialization
 * - Supports filter-based search
 * - Shows appropriate loading, error, and empty states
 * 
 * @example
 * ```typescript
 * // Route configuration
 * {
 *   path: 'accounts',
 *   component: AccountListComponent,
 *   canActivate: [authGuard, tenantGuard]
 * }
 * ```
 */
@Component({
  selector: 'app-account-list',
  standalone: true,
  imports: [
    CommonModule,
    AccountCardComponent,
    PaginationComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    FilterBarComponent
  ],
  templateUrl: './account-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountListComponent implements OnInit {
  private accountsApi = inject(AccountsApiService);
  private tenantService = inject(TenantService);
  private router = inject(Router);

  accounts = signal<Account[]>([]);
  loadingState = createLoadingState();
  pagination = createPaginationState();
  
  // Filters
  statusFilter = signal<AccountStatus | undefined>(undefined);
  typeFilter = signal<AccountType | undefined>(undefined);

  ngOnInit(): void {
    this.loadAccounts();
  }

  /**
   * Loads accounts from the API with current pagination and filters.
   * 
   * Fetches paginated account data based on current state (page, filters).
   * Updates loading and error states appropriately.
   */
  loadAccounts(): void {
    const tenantId = this.tenantService.getCurrentTenantId();
    setLoading(this.loadingState, true);

    this.accountsApi.getAccounts(
      tenantId,
      this.pagination.currentPage(),
      this.pagination.pageSize(),
      this.statusFilter(),
      this.typeFilter()
    ).subscribe({
      next: (response: any) => {
        // API returns 'accounts' instead of 'data'
        this.accounts.set(response.accounts || response.data || []);
        
        // Map API pagination to our pagination state
        if (response.pagination) {
          const paginationData = response.pagination;
          this.pagination.currentPage.set(paginationData.currentPage || 1);
          this.pagination.totalPages.set(paginationData.totalPages || 0);
          this.pagination.totalItems.set(paginationData.totalCount || paginationData.totalItems || 0);
          this.pagination.pageSize.set(paginationData.pageSize || 50);
          this.pagination.hasNext.set((paginationData.currentPage || 1) < (paginationData.totalPages || 0));
          this.pagination.hasPrevious.set((paginationData.currentPage || 1) > 1);
        }
        
        setLoading(this.loadingState, false);
      },
      error: (err) => {
        console.error('Failed to load accounts:', err);
        setError(this.loadingState, 'Failed to load accounts. Please try again.');
      }
    });
  }

  /**
   * Handles page change events from pagination component.
   * 
   * @param page - The new page number to load (1-indexed)
   */
  onPageChange(page: number): void {
    this.pagination.currentPage.set(page);
    this.loadAccounts();
  }

  /**
   * Handles account card click events.
   * 
   * Navigates to the account detail page.
   * 
   * @param account - The account that was clicked
   */
  onAccountClick(account: Account): void {
    this.router.navigate(['/accounts', account.id]);
  }

  /**
   * Applies filter changes and reloads accounts.
   * 
   * Resets to first page when filters change.
   */
  onApplyFilters(): void {
    resetToFirstPage(this.pagination);
    this.loadAccounts();
  }

  /**
   * Clears all filters and reloads accounts.
   * 
   * Resets to first page and removes all active filters.
   */
  onClearFilters(): void {
    this.statusFilter.set(undefined);
    this.typeFilter.set(undefined);
    resetToFirstPage(this.pagination);
    this.loadAccounts();
  }

  /**
   * Retries loading accounts after an error.
   * 
   * Called from error state component's retry button.
   */
  onRetry(): void {
    this.loadAccounts();
  }

  /**
   * TrackBy function for account iteration optimization.
   * 
   * @param index - The index of the account
   * @param account - The account object
   * @returns Unique identifier for the account
   */
  trackByAccountId(index: number, account: Account): string {
    return account.id;
  }
}
