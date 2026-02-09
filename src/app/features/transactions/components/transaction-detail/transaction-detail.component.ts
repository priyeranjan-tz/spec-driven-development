import { Component, OnInit, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TransactionsApiService } from '../../services/transactions-api.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { LedgerEntry } from '../../models/ledger-entry.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { RunningBalanceDisplayComponent } from '../running-balance-display/running-balance-display.component';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    CurrencyFormatPipe,
    DateFormatPipe,
    RunningBalanceDisplayComponent
  ],
  templateUrl: './transaction-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionDetailComponent implements OnInit {
  private transactionsApi = inject(TransactionsApiService);
  private tenantService = inject(TenantService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private destroyRef = takeUntilDestroyed();

  accountId = signal<string>('');
  ledgerEntry = signal<LedgerEntry | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit(): void {
    // Get account ID and ledger entry ID from route
    this.route.parent?.params.pipe(this.destroyRef).subscribe((parentParams: any) => {
      const accountId = parentParams['id'];
      if (accountId) {
        this.accountId.set(accountId);
      }
    });

    this.route.params.pipe(this.destroyRef).subscribe((params: any) => {
      const ledgerEntryId = params['ledgerEntryId'];
      if (ledgerEntryId) {
        this.loadLedgerEntry(ledgerEntryId);
      }
    });
  }

  loadLedgerEntry(ledgerEntryId: string): void {
    const tenantId = this.tenantService.getCurrentTenantId();
    if (!tenantId) {
      this.error.set('No tenant selected');
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.transactionsApi.getLedgerEntry(
      tenantId,
      this.accountId(),
      ledgerEntryId
    ).subscribe({
      next: (entry) => {
        this.ledgerEntry.set(entry);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load ledger entry:', err);
        if (err.status === 404) {
          this.error.set('Transaction not found');
        } else {
          this.error.set('Failed to load transaction details. Please try again.');
        }
        this.isLoading.set(false);
      }
    });
  }

  onRetry(): void {
    const ledgerEntryId = this.route.snapshot.params['ledgerEntryId'];
    if (ledgerEntryId) {
      this.loadLedgerEntry(ledgerEntryId);
    }
  }

  goBack(): void {
    this.router.navigate(['/accounts', this.accountId()], {
      queryParams: { tab: 'transactions' }
    });
  }

  get metadataEntries(): Array<{ key: string; value: unknown }> {
    const entry = this.ledgerEntry();
    if (!entry || !entry.metadata) {
      return [];
    }
    return Object.entries(entry.metadata)
      .map(([key, value]) => ({ key, value }));
  }

  /**
   * TrackBy function for metadata iteration optimization.
   * 
   * @param index - The index of the metadata entry
   * @param item - The metadata entry object
   * @returns Unique identifier for the metadata entry
   */
  trackByMetadataKey(index: number, item: { key: string; value: unknown }): string {
    return item.key;
  }
}
