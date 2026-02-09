import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Reusable button component with variants, sizes, and loading states.
 * 
 * Provides a consistent button interface across the application with support for
 * multiple visual variants, sizes, loading indicators, and disabled states.
 * 
 * @remarks
 * - Uses OnPush change detection for performance
 * - Automatically disables when loading
 * - Emits click events only when enabled and not loading
 * - Supports 4 variants: primary, secondary, danger, ghost
 * - Supports 3 sizes: sm, md, lg
 * - Styled with Tailwind CSS
 * 
 * @example
 * ```html
 * <!-- Primary button -->
 * <app-button
 *   variant="primary"
 *   (buttonClick)="save()">
 *   Save
 * </app-button>
 * 
 * <!-- Loading state -->
 * <app-button
 *   variant="primary"
 *   [loading]="isSaving"
 *   (buttonClick)="save()">
 *   Save
 * </app-button>
 * 
 * <!-- Disabled button -->
 * <app-button
 *   variant="secondary"
 *   [disabled]="!form.valid"
 *   (buttonClick)="submit()">
 *   Submit
 * </app-button>
 * 
 * <!-- Danger button (delete) -->
 * <app-button
 *   variant="danger"
 *   size="sm"
 *   (buttonClick)="delete()">
 *   Delete
 * </app-button>
 * 
 * <!-- Ghost button (subtle) -->
 * <app-button
 *   variant="ghost"
 *   (buttonClick)="cancel()">
 *   Cancel
 * </app-button>
 * 
 * <!-- Submit button in form -->
 * <app-button
 *   type="submit"
 *   variant="primary">
 *   Create Account
 * </app-button>
 * ```
 */
@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled || loading"
      [attr.aria-busy]="loading"
      [attr.aria-disabled]="disabled || loading"
      [class]="buttonClasses"
      (click)="handleClick($event)"
    >
      <span *ngIf="loading" class="inline-block animate-spin mr-2" aria-hidden="true">⟳</span>
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    button {
      @apply px-4 py-2 rounded font-medium transition-colors duration-200;
      @apply focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2;
    }
    button:disabled {
      @apply opacity-50 cursor-not-allowed;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() variant: 'primary' | 'secondary' | 'danger' | 'ghost' = 'primary';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() disabled = false;
  @Input() loading = false;
  @Output() buttonClick = new EventEmitter<Event>();

  get buttonClasses(): string {
    const baseClasses = 'inline-flex items-center justify-center';
    const variantClasses = {
      primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
      secondary: 'bg-secondary-200 text-secondary-900 hover:bg-secondary-300 focus:ring-secondary-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
      ghost: 'bg-transparent text-secondary-700 hover:bg-secondary-100 focus:ring-secondary-500'
    };
    const sizeClasses = {
      sm: 'text-sm px-3 py-1.5',
      md: 'text-base px-4 py-2',
      lg: 'text-lg px-6 py-3'
    };

    return `${baseClasses} ${variantClasses[this.variant]} ${sizeClasses[this.size]}`;
  }

  /**
   * Handles button click events.
   * 
   * Only emits if button is enabled and not loading.
   * 
   * @param event - The click event
   * @internal
   */
  handleClick(event: Event): void {
    if (!this.disabled && !this.loading) {
      this.buttonClick.emit(event);
    }
  }
}
