import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AccountsApiService } from '../../services/accounts-api.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { Account } from '../../models/account.model';
import { AccountSummaryComponent } from '../../components/account-summary/account-summary.component';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { createLoadingState, setLoading, setError } from '../../../../core/utils/loading-state.util';
import { getErrorMessage } from '../../../../core/utils/api.util';

type TabType = 'summary' | 'transactions' | 'invoices';

/**
 * Account detail page component with tabbed navigation.
 * 
 * Displays detailed account information with tabs for summary, transactions,
 * and invoices. Handles loading account data and tab navigation.
 * 
 * @remarks
 * - Uses signals for reactive state management
 * - Uses OnPush change detection for performance
 * - Loads account data based on route parameter
 * - Supports query params for tab state
 * - Shows appropriate loading and error states
 * - Integrates with child routes for transactions and invoices
 * 
 * @example
 * ```typescript
 * // Route configuration
 * {
 *   path: 'accounts/:id',
 *   component: AccountDetailComponent,
 *   canActivate: [authGuard, tenantGuard],
 *   children: [
 *     { path: 'transactions', component: TransactionListComponent },
 *     { path: 'invoices', component: InvoiceListComponent }
 *   ]
 * }
 * ```
 */
@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AccountSummaryComponent,
    LoadingSpinnerComponent,
    ErrorStateComponent
  ],
  templateUrl: './account-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountDetailComponent implements OnInit {
  private accountsApi = inject(AccountsApiService);
  private tenantService = inject(TenantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = takeUntilDestroyed();

  account = signal<Account | null>(null);
  loadingState = createLoadingState();
  activeTab = signal<TabType>('summary');

  readonly tabs: { id: TabType; label: string }[] = [
    { id: 'summary', label: 'Summary' },
    { id: 'transactions', label: 'Transactions' },
    { id: 'invoices', label: 'Invoices' }
  ];

  ngOnInit(): void {
    this.route.params.pipe(this.destroyRef).subscribe((params: any) => {
      const accountId = params['id'];
      if (accountId) {
        this.loadAccount(accountId);
      }
    });

    this.route.queryParams.pipe(this.destroyRef).subscribe((queryParams: any) => {
      const tab = queryParams['tab'] as TabType;
      if (tab && ['summary', 'transactions', 'invoices'].includes(tab)) {
        this.activeTab.set(tab);
      }
    });
  }

  /**
   * Loads account data from the API.
   * 
   * @param accountId - The UUID of the account to load
   */
  loadAccount(accountId: string): void {
    const tenantId = this.tenantService.getCurrentTenantId();
    setLoading(this.loadingState, true);

    this.accountsApi.getAccount(tenantId, accountId).subscribe({
      next: (account) => {
        this.account.set(account);
        setLoading(this.loadingState, false);
      },
      error: (err) => {
        console.error('Failed to load account:', err);
        const errorMsg = getErrorMessage(err, 'Failed to load account. Please try again.');
        setError(this.loadingState, errorMsg);
      }
    });
  }

  /**
   * Selects a tab and updates navigation.
   * 
   * Updates the active tab state and navigates to appropriate child route.
   * Updates query params to preserve tab state on reload.
   * 
   * @param tab - The tab to select ('summary', 'transactions', 'invoices')
   */
  selectTab(tab: TabType): void {
    this.activeTab.set(tab);
    
    if (tab === 'transactions') {
      // Navigate to transactions child route
      this.router.navigate(['transactions'], {
        relativeTo: this.route,
        queryParams: { tab },
        queryParamsHandling: 'merge'
      });
    } else if (tab === 'invoices') {
      // Navigate to invoices child route
      this.router.navigate(['invoices'], {
        relativeTo: this.route,
        queryParams: { tab },
        queryParamsHandling: 'merge'
      });
    } else {
      // For other tabs (summary), just update query params
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { tab },
        queryParamsHandling: 'merge'
      });
    }
  }

  /**
   * Retries loading account after an error.
   * 
   * Called from error state component's retry button.
   */
  onRetry(): void {
    const accountId = this.route.snapshot.params['id'];
    if (accountId) {
      this.loadAccount(accountId);
    }
  }

  /**
   * Navigates back to the account list.
   * 
   * Called from back button in the UI.
   */
  goBack(): void {
    this.router.navigate(['/accounts']);
  }

  /**
   * TrackBy function for tab iteration optimization.
   * 
   * @param index - The index of the tab
   * @param item - The tab object
   * @returns Unique identifier for the tab
   */
  trackByTabId(index: number, item: { id: TabType; label: string }): TabType {
    return item.id;
  }
}
