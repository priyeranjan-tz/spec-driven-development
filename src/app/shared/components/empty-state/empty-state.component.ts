import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Empty state component for displaying when no data is available.
 * 
 * Shows a friendly message when lists or views have no content to display.
 * Helps distinguish between loading states, errors, and legitimately empty data.
 * 
 * @remarks
 * - Shows customizable icon (emoji by default)
 * - Supports custom actions via ng-content
 * - Uses OnPush change detection
 * - Styled with Tailwind CSS
 * 
 * @example
 * ```html
 * <!-- Basic usage -->
 * <app-empty-state
 *   *ngIf="accounts.length === 0 && !isLoading"
 *   title="No accounts found"
 *   message="There are no accounts to display.">
 * </app-empty-state>
 * 
 * <!-- Custom icon -->
 * <app-empty-state
 *   icon="📄"
 *   title="No invoices"
 *   message="This account has no invoices yet.">
 * </app-empty-state>
 * 
 * <!-- With action button -->
 * <app-empty-state
 *   title="No results found"
 *   message="Try adjusting your filters.">
 *   <app-button variant="primary" (buttonClick)="clearFilters()">
 *     Clear Filters
 *   </app-button>
 * </app-empty-state>
 * 
 * <!-- Search results empty state -->
 * <app-empty-state
 *   icon="🔍"
 *   title="No matching accounts"
 *   message="No accounts match your search criteria.">
 *   <app-button variant="ghost" (buttonClick)="clearSearch()">
 *     Clear Search
 *   </app-button>
 * </app-empty-state>
 * ```
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex flex-col items-center justify-center py-12 px-4" role="status" aria-live="polite">
      <div class="text-6xl mb-4" aria-hidden="true">{{ icon }}</div>
      <h2 class="text-lg font-medium text-secondary-900 mb-2">{{ title }}</h2>
      <p class="text-sm text-secondary-600 mb-6 text-center max-w-md">{{ message }}</p>
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input() title = 'No data available';
  @Input() message = 'There is no data to display at this time.';
}
