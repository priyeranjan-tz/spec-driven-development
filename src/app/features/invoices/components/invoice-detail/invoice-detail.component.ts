import { Component, OnInit, inject, signal, ChangeDetectionStrategy, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, finalize } from 'rxjs';
import { InvoicesApiService } from '../../services/invoices-api.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { Invoice } from '../../models/invoice.model';
import { LoadingSpinnerComponent } from '../../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorStateComponent } from '../../../../shared/components/error-state/error-state.component';
import { InvoiceLineItemsComponent } from '../invoice-line-items/invoice-line-items.component';
import { InvoiceMetadataEditorComponent } from '../invoice-metadata-editor/invoice-metadata-editor.component';
import { PdfDownloadButtonComponent } from '../pdf-download-button/pdf-download-button.component';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { getInvoiceStatusClass } from '../../../../core/utils/status.util';
import { UI_TIMEOUTS } from '../../../../core/constants/app.constants';

/**
 * Invoice Detail Component
 * Displays full invoice information including header, financial details, and line items
 * Supports navigation to related ledger entries and metadata editing
 */
@Component({
  selector: 'app-invoice-detail',
  standalone: true,
  imports: [
    CommonModule,
    LoadingSpinnerComponent,
    ErrorStateComponent,
    InvoiceLineItemsComponent,
    InvoiceMetadataEditorComponent,
    PdfDownloadButtonComponent,
    CurrencyFormatPipe,
    DateFormatPipe
  ],
  templateUrl: './invoice-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private invoicesApi = inject(InvoicesApiService);
  protected tenantService = inject(TenantService);

  invoice = signal<Invoice | null>(null);
  isLoading = signal(true);
  error = signal<string | null>(null);
  
  // Edit mode state
  isEditMode = signal(false);
  isSaving = signal(false);
  successMessage = signal<string | null>(null);
  saveError = signal<string | null>(null);
  hasUnsavedChanges = signal(false);

  metadata = computed(() => {
    const inv = this.invoice();
    return inv ? {
      notes: (inv as any).notes || '',
      internalReference: (inv as any).internalReference || '',
      billingContact: (inv as any).billingContact || ''
    } : { notes: '', internalReference: '', billingContact: '' };
  });

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges()) {
      $event.preventDefault();
      $event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
    }
  }

  ngOnInit(): void {
    this.loadInvoice();
  }

  /**
   * Loads invoice data from the API.
   */
  private loadInvoice(): void {
    const invoiceId = this.route.snapshot.paramMap.get('invoiceId');
    const accountId = this.route.parent?.snapshot.paramMap.get('id');
    const tenantId = this.tenantService.getCurrentTenantId();

    if (!invoiceId || !accountId || !tenantId) {
      this.error.set('Missing required parameters');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.invoicesApi.getInvoice(tenantId, accountId, invoiceId)
      .pipe(
        catchError(err => {
          const errorMsg = err.status === 404 
            ? 'Invoice not found' 
            : 'Failed to load invoice. Please try again.';
          this.error.set(errorMsg);
          return of(null);
        }),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe(response => {
        if (response) {
          this.invoice.set(response.data);
        }
      });
  }

  enterEditMode(): void {
    this.isEditMode.set(true);
    this.successMessage.set(null);
    this.saveError.set(null);
    this.hasUnsavedChanges.set(false);
  }

  /**
   * Saves invoice metadata changes.
   */
  saveMetadata(metadata: { notes: string; internalReference: string; billingContact: string }): void {
    const invoiceId = this.route.snapshot.paramMap.get('invoiceId');
    const accountId = this.route.parent?.snapshot.paramMap.get('id');
    const tenantId = this.tenantService.getCurrentTenantId();

    if (!invoiceId || !accountId || !tenantId) {
      this.saveError.set('Missing required parameters');
      return;
    }

    this.isSaving.set(true);
    this.saveError.set(null);

    this.invoicesApi.updateInvoiceMetadata(tenantId, accountId, invoiceId, metadata)
      .pipe(
        catchError(err => {
          this.saveError.set('Failed to update metadata. Please try again.');
          return of(null);
        }),
        finalize(() => this.isSaving.set(false))
      )
      .subscribe(response => {
        if (response) {
          this.invoice.set(response.data);
          this.isEditMode.set(false);
          this.hasUnsavedChanges.set(false);
          this.successMessage.set('Metadata updated successfully');
          setTimeout(() => this.successMessage.set(null), UI_TIMEOUTS.SUCCESS_MESSAGE);
        }
      });
  }

  cancelEdit(): void {
    if (this.hasUnsavedChanges()) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmed) {
        return;
      }
    }
    this.isEditMode.set(false);
    this.saveError.set(null);
    this.hasUnsavedChanges.set(false);
  }

  retry(): void {
    this.loadInvoice();
  }

  goBack(): void {
    if (this.hasUnsavedChanges()) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to leave?');
      if (!confirmed) {
        return;
      }
    }
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  viewRelatedLedgerEntries(): void {
    const accountId = this.route.parent?.snapshot.paramMap.get('id');
    const invoiceId = this.invoice()?.id;

    if (accountId && invoiceId) {
      this.router.navigate(['/accounts', accountId], {
        queryParams: { tab: 'transactions', invoiceId }
      });
    }
  }

  /**
   * Gets CSS class for invoice status styling.
   */
  getStatusClass(status: string): string {
    return getInvoiceStatusClass(status);
  }
}
