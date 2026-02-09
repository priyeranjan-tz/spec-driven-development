import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Account } from '../../models/account.model';
import { AccountStatus } from '../../models/account-status.enum';
import { CurrencyFormatPipe } from '../../../../shared/pipes/currency-format.pipe';
import { DateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

/**
 * Account summary component for displaying detailed account information.
 * 
 * Shows comprehensive account details including name, type, status, balance,
 * and last invoice date. Used in account detail views or summary panels.
 * 
 * @remarks
 * - Uses OnPush change detection for performance
 * - Requires Account model as input
 * - Uses currency and date format pipes
 * - Status badges are color-coded
 * - Styled with Tailwind CSS
 * 
 * @example
 * ```html
 * <!-- In account detail template -->
 * <app-account-summary [account]="account"></app-account-summary>
 * 
 * <!-- With loading state -->
 * <app-loading-spinner *ngIf="isLoading"></app-loading-spinner>
 * <app-account-summary
 *   *ngIf="!isLoading && account"
 *   [account]="account">
 * </app-account-summary>
 * ```
 */
@Component({
  selector: 'app-account-summary',
  standalone: true,
  imports: [CommonModule, CurrencyFormatPipe, DateFormatPipe],
  templateUrl: './account-summary.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountSummaryComponent {
  @Input({ required: true }) account!: Account;

  AccountStatus = AccountStatus;

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
    switch (status) {
      case AccountStatus.Active:
        return 'bg-green-100 text-green-800';
      case AccountStatus.Suspended:
        return 'bg-yellow-100 text-yellow-800';
      case AccountStatus.Closed:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
