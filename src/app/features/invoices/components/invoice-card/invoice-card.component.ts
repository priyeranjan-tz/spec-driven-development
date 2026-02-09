import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Invoice } from '../../models/invoice.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { getInvoiceStatusClass } from '../../../../core/utils/status.util';

@Component({
  selector: 'app-invoice-card',
  standalone: true,
  imports: [
    CommonModule,
    CurrencyFormatPipe,
    DateFormatPipe
  ],
  templateUrl: './invoice-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvoiceCardComponent {
  @Input({ required: true }) invoice!: Invoice;
  @Input({ required: true }) accountId!: string;

  /**
   * Gets CSS classes for invoice status badge styling.
   */
  getStatusClass(): string {
    return getInvoiceStatusClass(this.invoice.status);
  }

  getFrequencyLabel(): string {
    switch (this.invoice.frequency) {
      case 'PerRide':
        return 'Per Ride';
      case 'Daily':
        return 'Daily';
      case 'Weekly':
        return 'Weekly';
      case 'Monthly':
        return 'Monthly';
      default:
        return this.invoice.frequency;
    }
  }
}
