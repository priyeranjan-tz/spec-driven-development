import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InvoicesApiService } from '../../services/invoices-api.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { Invoice } from '../../models/invoice.model';
import { InvoiceStatus } from '../../models/invoice-status.enum';
import { InvoiceFrequency } from '../../models/invoice-frequency.enum';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { EmptyStateComponent } from '../../../../shared/components/empty-state/empty-state.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { InvoiceCardComponent } from '../../components/invoice-card/invoice-card.component';
import { createPaginationState, updatePaginationFromResponse, resetToFirstPage } from '../../../../core/utils/pagination.util';
import { createLoadingState, setLoading, setError } from '../../../../core/utils/loading-state.util';

/**
 * Invoice list page component displaying paginated invoices with filtering and sorting.
 * 
 * Shows invoices for a specific account with support for filtering by status and frequency,
 * sorting by various fields, and pagination. Typically used as a child route under account detail.
 * 
 * @remarks
 * - Uses signals for reactive state management
 * - Uses OnPush change detection for performance
 * - Gets account ID from parent route params
 * - Supports multiple filter dimensions (status, frequency)
 * - Supports sorting by any invoice field
 * - Shows appropriate loading, error, and empty states
 * 
 * @example
 * ```typescript
 * // Child route configuration under account detail
 * {
 *   path: 'accounts/:id',
 *   component: AccountDetailComponent,
 *   children: [
 *     {
 *       path: 'invoices',
 *       component: InvoiceListComponent
 *     }
 *   ]
 * }
 * ```
 */
@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    PaginationComponent,
    LoadingSpinnerComponent,
    EmptyStateComponent,
    ErrorStateComponent,
    InvoiceCardComponent
  ],
  templateUrl: './invoice-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceListComponent implements OnInit {
  private invoicesApi = inject(InvoicesApiService);
  private tenantService = inject(TenantService);
  private route = inject(ActivatedRoute);
  private destroyRef = takeUntilDestroyed();

  accountId = signal<string>('');
  invoices = signal<Invoice[]>([]);
  loadingState = createLoadingState();
  pagination = createPaginationState();

  // Filters
  statusFilter = signal<InvoiceStatus | undefined>(undefined);
  frequencyFilter = signal<InvoiceFrequency | undefined>(undefined);
  
  // Sorting
  sortBy = signal<string | undefined>(undefined);
  sortOrder = signal<'asc' | 'desc'>('asc');

  readonly statuses = [
    { value: '', label: 'All Statuses' },
    { value: InvoiceStatus.Draft, label: 'Draft' },
    { value: InvoiceStatus.Issued, label: 'Issued' },
    { value: InvoiceStatus.Paid, label: 'Paid' },
    { value: InvoiceStatus.Overdue, label: 'Overdue' },
    { value: InvoiceStatus.Cancelled, label: 'Cancelled' }
  ];

  readonly frequencies = [
    { value: '', label: 'All Frequencies' },
    { value: InvoiceFrequency.PerRide, label: 'Per Ride' },
    { value: InvoiceFrequency.Daily, label: 'Daily' },
    { value: InvoiceFrequency.Weekly, label: 'Weekly' },
    { value: InvoiceFrequency.Monthly, label: 'Monthly' }
  ];

  ngOnInit(): void {
    // Get account ID from parent route
    this.route.parent?.params.pipe(this.destroyRef).subscribe((params: any) => {
      const id = params['id'];
      if (id) {
        this.accountId.set(id);
        this.loadInvoices();
      }
    });
  }

  /**
   * Loads invoices from the API with current pagination, filters, and sorting.
   * 
   * Fetches paginated invoice data based on current state.
   * Updates loading and error states appropriately.
   */
  loadInvoices(): void {
    const tenantId = this.tenantService.getCurrentTenantId();
    if (!tenantId) {
      setError(this.loadingState, 'No tenant selected');
      return;
    }

    setLoading(this.loadingState, true);

    this.invoicesApi.getInvoices(
      tenantId,
      this.accountId(),
      this.pagination.currentPage(),
      this.pagination.pageSize(),
      this.statusFilter(),
      this.frequencyFilter(),
      this.sortBy(),
      this.sortOrder()
    ).subscribe({
      next: (response: any) => {
        // API returns 'invoices' instead of 'data'
        this.invoices.set(response.invoices || response.data || []);
        
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
        console.error('Failed to load invoices:', err);
        setError(this.loadingState, 'Failed to load invoices. Please try again.');
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
    this.loadInvoices();
  }

  /**
   * Handles status filter changes.
   * 
   * Resets to first page when filter changes.
   * 
   * @param status - The selected status value (empty string for "All")
   */
  onStatusFilterChange(status: string): void {
    this.statusFilter.set(status ? (status as InvoiceStatus) : undefined);
    resetToFirstPage(this.pagination);
    this.loadInvoices();
  }

  /**
   * Handles frequency filter changes.
   * 
   * Resets to first page when filter changes.
   * 
   * @param frequency - The selected frequency value (empty string for "All")
   */
  onFrequencyFilterChange(frequency: string): void {
    this.frequencyFilter.set(frequency ? (frequency as InvoiceFrequency) : undefined);
    resetToFirstPage(this.pagination);
    this.loadInvoices();
  }

  /**
   * Clears all filters and reloads invoices.
   * 
   * Resets to first page and removes all active filters.
   */
  clearFilters(): void {
    this.statusFilter.set(undefined);
    this.frequencyFilter.set(undefined);
    resetToFirstPage(this.pagination);
    this.loadInvoices();
  }

  /**
   * Handles sort change events.
   * 
   * Toggles sort direction if same column, otherwise sets new column with ascending order.
   * Resets to first page when sort changes.
   * 
   * @param column - The column name to sort by (e.g., 'invoiceNumber', 'dueDate')
   */
  onSort(column: string): void {
    if (this.sortBy() === column) {
      // Toggle sort order if same column
      this.sortOrder.set(this.sortOrder() === 'asc' ? 'desc' : 'asc');
    } else {
      // New column, default to ascending
      this.sortBy.set(column);
      this.sortOrder.set('asc');
    }
    resetToFirstPage(this.pagination);
    this.loadInvoices();
  }

  /**
   * Returns CSS class for sort icon display.
   * 
   * @param column - The column name
   * @returns CSS class string ('sort-asc', 'sort-desc', or '')
   */
  getSortIconClass(column: string): string {
    if (this.sortBy() !== column) {
      return '';
    }
    return this.sortOrder() === 'asc' ? 'sort-asc' : 'sort-desc';
  }

  /**
   * Returns ARIA sort attribute value for accessibility.
   * 
   * @param column - The column name
   * @returns 'ascending', 'descending', or null
   */
  getSortAriaValue(column: string): string | null {
    if (this.sortBy() !== column) {
      return null;
    }
    return this.sortOrder() === 'asc' ? 'ascending' : 'descending';
  }

  /**
   * Retries loading invoices after an error.
   * 
   * Called from error state component's retry button.
   */
  onRetry(): void {
    this.loadInvoices();
  }

  /**
   * TrackBy function for invoice iteration optimization.
   * 
   * @param index - The index of the invoice
   * @param invoice - The invoice object
   * @returns Unique identifier for the invoice
   */
  trackByInvoiceId(index: number, invoice: Invoice): string {
    return invoice.id;
  }

  /**
   * TrackBy function for filter option iteration optimization.
   * 
   * @param index - The index of the filter option
   * @param item - The filter option object
   * @returns Unique identifier for the filter option
   */
  trackByFilterValue(index: number, item: { value: string; label: string }): string {
    return item.value;
  }

  /**
   * Checks if any filters are currently active.
   * 
   * Used to show/hide the "Clear Filters" button.
   * 
   * @returns True if any filters are applied
   */
  hasActiveFilters(): boolean {
    return !!(this.statusFilter() || this.frequencyFilter());
  }
}
