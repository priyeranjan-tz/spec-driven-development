import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';

@Component({
  selector: 'app-running-balance-display',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe],
  templateUrl: './running-balance-display.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RunningBalanceDisplayComponent {
  @Input({ required: true }) balance!: number;

  get isNegative(): boolean {
    return this.balance < 0;
  }

  get isPositive(): boolean {
    return this.balance > 0;
  }

  get isZero(): boolean {
    return this.balance === 0;
  }

  get absoluteBalance(): number {
    return Math.abs(this.balance);
  }
}
