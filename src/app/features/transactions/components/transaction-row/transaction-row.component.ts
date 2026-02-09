import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LedgerEntry } from '../../models/ledger-entry.model';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { RunningBalanceDisplayComponent } from '../running-balance-display/running-balance-display.component';

@Component({
  selector: '[app-transaction-row]',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CurrencyFormatPipe,
    DateFormatPipe,
    RunningBalanceDisplayComponent
  ],
  templateUrl: './transaction-row.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionRowComponent {
  @Input({ required: true }) ledgerEntry!: LedgerEntry;
  @Input({ required: true }) accountId!: string;
}
