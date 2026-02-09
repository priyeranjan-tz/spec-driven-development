import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { sanitizeFilename } from '../../../core/utils/sanitization.util';
import { LoggerService } from '../../../core/services/logger.service';

/**
 * Service for handling invoice PDF generation and download.
 * 
 * Manages PDF download requests to the backend, handles binary blob responses,
 * generates appropriate filenames, and triggers browser downloads. Includes
 * automatic cleanup of temporary download URLs.
 * 
 * @remarks
 * - PDFs are fetched as binary blobs from the backend
 * - Filenames follow the format: {invoiceNumber}_{YYYY-MM-DD}.pdf
 * - Download links are automatically cleaned up after 100ms
 * - Special characters in invoice numbers are sanitized for filesystem compatibility
 * - Uses centralized sanitization utilities for enhanced security
 * 
 * @example
 * ```typescript
 * // Inject service
 * private pdfService = inject(PdfDownloadService);
 * 
 * // Download invoice PDF
 * this.pdfService.downloadInvoicePdf(
 *   tenantId,
 *   accountId,
 *   invoiceId,
 *   'INV-2026-001',
 *   '2026-01-15T00:00:00Z'
 * ).subscribe({
 *   next: () => this.logger.info('PDF download completed'),
 *   error: (err) => this.logger.error('PDF download failed', err)
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class PdfDownloadService {
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private readonly baseUrl = '/api';

  /**
   * Downloads an invoice as a PDF file.
   * 
   * Fetches the PDF as a binary blob from the backend and triggers a browser download.
   * The filename is automatically generated from the invoice number and date, or extracted
   * from the Content-Disposition header if provided by the backend.
   * 
   * @param tenantId - The UUID of the tenant
   * @param accountId - The UUID of the account
   * @param invoiceId - The UUID of the invoice
   * @param invoiceNumber - The invoice number for filename generation (e.g., "INV-2026-001")
   * @param issuedAt - The invoice issue date in ISO 8601 format for filename generation
   * @returns Observable of the PDF blob
   * 
   * @throws HTTP error if PDF generation fails (500) or invoice not found (404)
   * 
   * @example
   * ```typescript
   * // Basic usage
   * downloadInvoicePdf(
   *   'tenant-123',
   *   'account-456',
   *   'invoice-789',
   *   'INV-2026-001',
   *   '2026-01-15T12:00:00Z'
   * ).subscribe({
   *   next: () => {
   *     // Browser download triggered
   *     this.showSuccess('PDF downloaded');
   *   },
   *   error: (err) => {
   *     this.showError('Failed to download PDF');
   *   }
 * });
   * ```
   */
  downloadInvoicePdf(
    tenantId: string,
    accountId: string,
    invoiceNumber: string,
    invoiceNumberDisplay: string,
    issuedAt: string
  ): Observable<Blob> {
    // Note: PDF endpoint may not exist in backend API yet
    return this.http.get(
      `${this.baseUrl}/invoices/${invoiceNumber}/pdf`,
      {
        responseType: 'blob',
        observe: 'response'
      }
    ).pipe(
      tap(response => {
        if (response.body) {
          this.logger.debug('PDF blob received, triggering download');
          this.triggerDownload(response.body, invoiceNumberDisplay, issuedAt, response.headers.get('Content-Disposition'));
        }
      }),
      map(response => response.body!),
      catchError(error => {
        this.logger.error('PdfDownloadService.downloadInvoicePdf error', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Triggers a browser download of the PDF blob.
   * 
   * Creates a temporary download link, clicks it programmatically to trigger the download,
   * then cleans up the link and blob URL after 100ms.
   * 
   * @param blob - The PDF binary blob to download
   * @param invoiceNumber - Invoice number for filename generation
   * @param issuedAt - Invoice issue date for filename generation
   * @param contentDisposition - Optional Content-Disposition header from HTTP response
   * @private
   */
  private triggerDownload(
    blob: Blob,
    invoiceNumber: string,
    issuedAt: string,
    contentDisposition: string | null
  ): void {
    const filename = this.generateFilename(invoiceNumber, issuedAt, contentDisposition);
    
    // Create download link
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Generates a filename for the PDF download.
   * 
   * Attempts to extract the filename from the Content-Disposition HTTP header first.
   * Falls back to generating a filename from invoice data in the format:
   * {sanitizedInvoiceNumber}_{YYYY-MM-DD}.pdf
   * 
   * Uses centralized sanitization utilities for enhanced security.
   * 
   * @param invoiceNumber - The invoice number to use in the filename
   * @param issuedAt - ISO 8601 date string to extract the date from
   * @param contentDisposition - Optional Content-Disposition header value
   * @returns Sanitized filename suitable for download
   * @private
   * 
   * @example
   * ```typescript
   * // From invoice data
   * generateFilename('INV-2026-001', '2026-01-15T12:00:00Z', null);
   * // Returns: "INV-2026-001_2026-01-15.pdf"
   * 
   * // With special characters
   * generateFilename('INV/2026/001', '2026-01-15T12:00:00Z', null);
   * // Returns: "INV-2026-001_2026-01-15.pdf" (slashes replaced)
   * ```
   */
  private generateFilename(
    invoiceNumber: string,
    issuedAt: string,
    contentDisposition: string | null
  ): string {
    // Try to extract filename from Content-Disposition header
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch && filenameMatch[1]) {
        const extractedFilename = filenameMatch[1].replace(/['"]/g, '');
        if (extractedFilename) {
          // Use centralized sanitization for security
          return sanitizeFilename(extractedFilename);
        }
      }
    }

    // Fallback: Generate filename from invoice data
    const date = issuedAt.split('T')[0]; // Extract YYYY-MM-DD
    const sanitizedNumber = sanitizeFilename(invoiceNumber);
    return `${sanitizedNumber}_${date}.pdf`;
  }
}
