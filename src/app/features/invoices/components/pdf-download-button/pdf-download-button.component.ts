import { Component, Input, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PdfDownloadService } from '../../services/pdf-download.service';
import { TenantService } from '../../../../core/services/tenant.service';
import { finalize } from 'rxjs/operators';

/**
 * PDF download button component for invoice PDF generation.
 * 
 * Provides a button that triggers invoice PDF download with loading state
 * and error handling. Uses signals for reactive state management.
 * 
 * @remarks
 * - Uses signals for reactive state (downloading, error)
 * - Uses OnPush change detection
 * - Disables button during download
 * - Shows inline error messages
 * - Automatically triggers browser download
 * - Requires all invoice identifiers as inputs
 * 
 * @example
 * ```html
 * <!-- In invoice detail template -->
 * <app-pdf-download-button
 *   [tenantId]="tenantId"
 *   [accountId]="accountId"
 *   [invoiceId]="invoice.id"
 *   [invoiceNumber]="invoice.invoiceNumber"
 *   [issuedAt]="invoice.issuedAt">
 * </app-pdf-download-button>
 * 
 * <!-- With conditional display (only for issued invoices) -->
 * <app-pdf-download-button
 *   *ngIf="invoice.status !== 'Draft'"
 *   [tenantId]="tenantId"
 *   [accountId]="accountId"
 *   [invoiceId]="invoice.id"
 *   [invoiceNumber]="invoice.invoiceNumber"
 *   [issuedAt]="invoice.issuedAt">
 * </app-pdf-download-button>
 * ```
 */
@Component({
  selector: 'app-pdf-download-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pdf-download-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PdfDownloadButtonComponent {
  @Input({ required: true }) tenantId!: string;
  @Input({ required: true }) accountId!: string;
  @Input({ required: true }) invoiceId!: string;
  @Input({ required: true }) invoiceNumber!: string;
  @Input({ required: true }) issuedAt!: string;

  private pdfDownloadService = inject(PdfDownloadService);

  downloading = signal(false);
  error = signal<string | null>(null);

  /**
   * Initiates PDF download for the invoice.
   * 
   * Calls the PdfDownloadService to fetch and download the PDF.
   * Manages loading and error states during the download process.
   * Prevents multiple simultaneous downloads.
   */
  downloadPdf(): void {
    if (this.downloading()) {
      return;
    }

    this.downloading.set(true);
    this.error.set(null);

    this.pdfDownloadService.downloadInvoicePdf(
      this.tenantId,
      this.accountId,
      this.invoiceId,
      this.invoiceNumber,
      this.issuedAt
    ).pipe(
      finalize(() => this.downloading.set(false))
    ).subscribe({
      next: () => {
        // Download triggered successfully
        this.error.set(null);
      },
      error: (err) => {
        console.error('Failed to download PDF:', err);
        
        if (err.status === 404) {
          this.error.set('Invoice not found');
        } else {
          this.error.set('Failed to generate PDF. Please try again.');
        }
      }
    });
  }

  /**
   * Clears any displayed error message.
   */
  clearError(): void {
    this.error.set(null);
  }
}
