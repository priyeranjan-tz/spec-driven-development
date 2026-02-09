import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceLineItem } from '../../models/invoice-line-item.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

/**
 * Invoice line items component for displaying invoice charges/rides.
 * 
 * Displays a formatted table of line items (rides/charges) associated with an invoice.
 * Shows ride details, dates, and amounts with proper formatting.
 * 
 * @remarks
 * - Uses OnPush change detection for performance
 * - Requires array of InvoiceLineItem as input
 * - Uses currency and date format pipes
 * - Includes trackBy for performance optimization
 * - Styled with Tailwind CSS
 * 
 * @example
 * ```html
 * <!-- In invoice detail template -->
 * <app-invoice-line-items [lineItems]="invoice.lineItems"></app-invoice-line-items>
 * 
 * <!-- With conditional display -->
 * <div *ngIf="invoice.lineItems.length > 0">
 *   <h3>Line Items</h3>
 *   <app-invoice-line-items [lineItems]="invoice.lineItems"></app-invoice-line-items>
 * </div>
 * <p *ngIf="invoice.lineItems.length === 0">No line items</p>
 * ```
 */
@Component({
  selector: 'app-invoice-line-items',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './invoice-line-items.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceLineItemsComponent {
  @Input({ required: true }) lineItems: InvoiceLineItem[] = [];

  /**
   * TrackBy function for line item iteration optimization.
   * 
   * @param index - The index of the line item
   * @param item - The line item object
   * @returns Unique identifier for the line item
   */
  trackByLineItemId(index: number, item: InvoiceLineItem): string {
    return item.id;
  }
}
