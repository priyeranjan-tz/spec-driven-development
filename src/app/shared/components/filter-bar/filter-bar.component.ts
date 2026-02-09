import { Component, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../button/button.component';

export interface FilterConfig {
  [key: string]: any;
}

/**
 * Flexible filter bar component for list views.
 * 
 * Provides a standardized filter UI with Apply/Clear actions. Filter controls
 * are projected via ng-content, making this component highly reusable.
 * 
 * @remarks
 * - Uses content projection for filter controls (dropdowns, inputs, etc.)
 * - Provides Apply and Clear buttons
 * - Parent handles actual filtering logic
 * - Uses OnPush change detection
 * - Styled with Tailwind CSS
 * 
 * @example
 * ```html
 * <!-- In list component template -->
 * <app-filter-bar (apply)="applyFilters()" (clear)="clearFilters()">
 *   <div class="flex flex-col">
 *     <label class="text-sm font-medium">Status</label>
 *     <select [(ngModel)]="statusFilter" class="border rounded px-2 py-1">
 *       <option value="">All</option>
 *       <option value="active">Active</option>
 *       <option value="suspended">Suspended</option>
 *     </select>
 *   </div>
 *   
 *   <div class="flex flex-col">
 *     <label class="text-sm font-medium">Type</label>
 *     <select [(ngModel)]="typeFilter" class="border rounded px-2 py-1">
 *       <option value="">All</option>
 *       <option value="organization">Organization</option>
 *       <option value="individual">Individual</option>
 *     </select>
 *   </div>
 * </app-filter-bar>
 * 
 * <!-- In list component class -->
 * statusFilter = '';
 * typeFilter = '';
 * 
 * applyFilters() {
 *   this.loadAccounts();
 * }
 * 
 * clearFilters() {
 *   this.statusFilter = '';
 *   this.typeFilter = '';
 *   this.loadAccounts();
 * }
 * ```
 */
@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <section class="bg-white px-4 py-3 border-b border-secondary-200" aria-label="Filter options">
      <div class="flex flex-wrap gap-4 items-end">
        <ng-content></ng-content>
        <div class="flex gap-2 ml-auto">
          <app-button
            variant="secondary"
            size="sm"
            [attr.aria-label]="'Clear all filters'"
            (buttonClick)="onClear()">
            Clear
          </app-button>
          <app-button
            variant="primary"
            size="sm"
            [attr.aria-label]="'Apply selected filters'"
            (buttonClick)="onApply()">
            Apply
          </app-button>
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FilterBarComponent {
  @Output() apply = new EventEmitter<void>();
  @Output() clear = new EventEmitter<void>();

  /**
   * Emits apply event when user clicks Apply button.
   * 
   * Parent component should handle actual filtering logic.
   * 
   * @internal
   */
  onApply(): void {
    this.apply.emit();
  }

  /**
   * Emits clear event when user clicks Clear button.
   * 
   * Parent component should reset filter state and reload data.
   * 
   * @internal
   */
  onClear(): void {
    this.clear.emit();
  }
}
