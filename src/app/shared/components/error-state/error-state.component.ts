import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';

/**
 * Error state component with retry functionality.
 * 
 * Displays error messages with an icon, title, description, and optional retry button.
 * Used for showing error states in list views, detail views, or when API calls fail.
 * 
 * @remarks
 * - Shows warning emoji icon by default
 * - Supports custom actions via ng-content
 * - Optional retry button with customizable text
 * - Uses OnPush change detection
 * - Styled with Tailwind CSS
 * 
 * @example
 * ```html
 * <!-- Basic usage -->
 * <app-error-state
 *   *ngIf="error"
 *   title="Failed to load accounts"
 *   message="Unable to fetch account data. Please try again."
 *   (retry)="loadAccounts()">
 * </app-error-state>
 * 
 * <!-- Without retry button -->
 * <app-error-state
 *   title="Access Denied"
 *   message="You do not have permission to access this resource."
 *   [showRetry]="false">
 * </app-error-state>
 * 
 * <!-- Custom retry button text -->
 * <app-error-state
 *   title="Connection Failed"
 *   message="Unable to connect to server."
 *   retryText="Try Again"
 *   (retry)="reconnect()">
 * </app-error-state>
 * 
 * <!-- With custom action buttons -->
 * <app-error-state
 *   title="Something went wrong"
 *   message="An unexpected error occurred."
 *   [showRetry]="false">
 *   <app-button variant="primary" (buttonClick)="goHome()">Go Home</app-button>
 *   <app-button variant="secondary" (buttonClick)="contactSupport()">Contact Support</app-button>
 * </app-error-state>
 * ```
 */
@Component({
  selector: 'app-error-state',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div 
      class="flex flex-col items-center justify-center py-12 px-4"
      role="alert"
      aria-live="assertive">
      <div class="text-6xl mb-4" aria-hidden="true">⚠️</div>
      <h2 class="text-lg font-medium text-red-900 mb-2">{{ title }}</h2>
      <p class="text-sm text-red-700 mb-6 text-center max-w-md">{{ message }}</p>
      <app-button
        *ngIf="showRetry"
        variant="primary"
        (buttonClick)="onRetry()"
        [attr.aria-label]="'Retry loading data'">
        {{ retryText }}
      </app-button>
      <ng-content></ng-content>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ErrorStateComponent {
  @Input() title = 'Something went wrong';
  @Input() message = 'An error occurred while loading data. Please try again.';
  @Input() showRetry = true;
  @Input() retryText = 'Retry';
  @Output() retry = new EventEmitter<void>();

  /**
   * Emits retry event when user clicks the retry button.
   * 
   * Parent component should handle retry logic (e.g., re-fetch data).
   * 
   * @internal
   */
  onRetry(): void {
    this.retry.emit();
  }
}
