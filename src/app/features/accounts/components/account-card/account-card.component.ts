import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Account } from '../../models/account.model';
import { AccountStatus } from '../../models/account-status.enum';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';
import { getAccountStatusClass } from '../../../../core/utils/status.util';

/**
 * Account card component for displaying individual account items in list views.
 * 
 * Shows account name, type, status, balance, and last invoice date in a clickable card format.
 * Used in account list views with grid or card layouts.
 * 
 * @remarks
 * - Uses OnPush change detection for performance
 * - Emits click events for navigation
 * - Requires Account model as input
 * - Uses currency and date format pipes
 * - Status badges are color-coded
 * - Styled with Tailwind CSS
 * 
 * @example
 * ```html
 * <!-- In account list template -->
 * <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
 *   <app-account-card
 *     *ngFor="let account of accounts; trackBy: trackById"
 *     [account]="account"
 *     (accountClick)="navigateToAccount($event)">
 *   </app-account-card>
 * </div>
 * 
 * <!-- In parent component -->
 * navigateToAccount(account: Account) {
 *   this.router.navigate(['/accounts', account.id]);
 * }
 * ```
 */
@Component({
  selector: 'app-account-card',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './account-card.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountCardComponent {
  @Input({ required: true }) account!: Account;
  @Output() accountClick = new EventEmitter<Account>();

  AccountStatus = AccountStatus;

  /**
   * Handles click events on the card.
   * 
   * Emits the account object for parent to handle navigation.
   */
  handleClick(): void {
    this.accountClick.emit(this.account);
  }

  /**
   * Returns Tailwind CSS classes for status badge color.
   * 
   * Maps account status to appropriate badge styling:
   * - Active: green
   * - Suspended: yellow
   * - Closed: red
   * 
   * @param status - The account status
   * @returns CSS class string for badge styling
   */
  getStatusColor(status: AccountStatus): string {
    return getAccountStatusClass(status);
  }

  /**
   * Returns human-readable label for account type.
   * 
   * @param type - The account type enum value
   * @returns Display label for the type
   */
  getTypeLabel(type: string): string {
    return type === 'organization' ? 'Organization' : 'Individual';
  }
}
