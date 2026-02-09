import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Loading spinner component for displaying loading states.
 * 
 * Shows an animated spinner with optional message text. Used to indicate
 * asynchronous operations in progress (data loading, API calls, etc.).
 * 
 * @remarks
 * - Uses CSS animation for smooth spinning effect
 * - Optional message displayed below spinner
 * - Uses OnPush change detection
 * - Styled with Tailwind CSS
 * 
 * @example
 * ```html
 * <!-- Basic usage -->
 * <app-loading-spinner *ngIf="isLoading"></app-loading-spinner>
 * 
 * <!-- With custom message -->
 * <app-loading-spinner
 *   *ngIf="isLoading"
 *   message="Loading accounts...">
 * </app-loading-spinner>
 * 
 * <!-- In async pipe pattern -->
 * <ng-container *ngIf="accounts$ | async as accounts; else loading">
 *   <app-table [data]="accounts"></app-table>
 * </ng-container>
 * <ng-template #loading>
 *   <app-loading-spinner message="Loading accounts..."></app-loading-spinner>
 * </ng-template>
 * ```
 */
@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="flex flex-col items-center justify-center py-12"
      role="status"
      aria-live="polite"
      aria-busy="true">
      <div 
        class="animate-spin rounded-full h-12 w-12 border-4 border-secondary-200 border-t-primary-600 mb-4"
        aria-hidden="true"></div>
      <p class="text-sm text-secondary-600">{{ message }}</p>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoadingSpinnerComponent {
  @Input() message = 'Loading...';
}
