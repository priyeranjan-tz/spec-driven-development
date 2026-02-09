import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortEvent {
  column: string;
  direction: SortDirection;
}

/**
 * Reusable table component with sorting support and optimized performance.
 * 
 * Provides a flexible, accessible data table with column configuration, sorting capabilities,
 * and performance optimizations via OnPush change detection and trackBy functions.
 * 
 * @remarks
 * - Uses OnPush change detection for better performance
 * - Requires trackBy on row content via ng-content
 * - Emits sort events for parent to handle
 * - Supports both sortable and non-sortable columns
 * - Styled with Tailwind CSS
 * 
 * @example
 * ```html
 * <!-- In parent component template -->
 * <app-table
 *   [columns]="columns"
 *   [sortColumn]="currentSortColumn"
 *   [sortDirection]="currentSortDirection"
 *   (sort)="onSort($event)">
 *   <tr *ngFor="let account of accounts; trackBy: trackById">
 *     <td>{{ account.name }}</td>
 *     <td>{{ account.currentBalance | currencyFormat }}</td>
 *   </tr>
 * </app-table>
 * 
 * <!-- In parent component class -->
 * columns: TableColumn[] = [
 *   { key: 'name', label: 'Account Name', sortable: true },
 *   { key: 'balance', label: 'Balance', sortable: true, width: '150px' }
 * ];
 * 
 * onSort(event: SortEvent) {
 *   this.currentSortColumn = event.column;
 *   this.currentSortDirection = event.direction;
 *   // Fetch sorted data from API
 * }
 * ```
 */
@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-secondary-200" role="table">
        <thead class="bg-secondary-50">
          <tr>
            <th *ngFor="let column of columns; trackBy: trackByKey"
                scope="col"
                [style.width]="column.width"
                class="px-6 py-3 text-left text-xs font-medium text-secondary-700 uppercase tracking-wider"
                [class.cursor-pointer]="column.sortable"
                [attr.aria-sort]="getAriaSortValue(column.key)"
                (click)="onSort(column)"
                (keydown.enter)="onSort(column)"
                (keydown.space)="onSort(column)"
                [tabindex]="column.sortable ? 0 : -1">
              <div class="flex items-center space-x-1">
                <span>{{ column.label }}</span>
                <span *ngIf="column.sortable && sortColumn === column.key" aria-hidden="true" class="ml-1">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
                <span *ngIf="column.sortable && sortColumn === column.key" class="sr-only">
                  {{ sortDirection === 'asc' ? 'sorted ascending' : 'sorted descending' }}
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-secondary-200">
          <ng-content></ng-content>
        </tbody>
      </table>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TableComponent {
  @Input() columns: TableColumn[] = [];
  @Input() sortColumn: string | null = null;
  @Input() sortDirection: SortDirection = null;
  @Output() sort = new EventEmitter<SortEvent>();

  /**
   * Gets ARIA sort value for column header.
   * 
   * Returns 'ascending', 'descending', or 'none' based on current sort state.
   */
  getAriaSortValue(columnKey: string): string {
    if (this.sortColumn !== columnKey) {
      return 'none';
    }
    if (this.sortDirection === 'asc') {
      return 'ascending';
    }
    if (this.sortDirection === 'desc') {
      return 'descending';
    }
    return 'none';
  }

  /**
   * Handles column header clicks for sorting.
   * 
   * Toggles sort direction on repeated clicks: null → asc → desc → null.
   * Only processes clicks on sortable columns.
   * 
   * @param column - The table column that was clicked
   * @internal
   */
  onSort(column: TableColumn): void {
    if (!column.sortable) return;

    let newDirection: SortDirection = 'asc';
    if (this.sortColumn === column.key) {
      newDirection = this.sortDirection === 'asc' ? 'desc' : this.sortDirection === 'desc' ? null : 'asc';
    }

    this.sort.emit({
      column: column.key,
      direction: newDirection
    });
  }

  /**
   * TrackBy function for column iteration optimization.
   * 
   * @param index - The index of the column
   * @param column - The column object
   * @returns Unique identifier for the column
   * @internal
   */
  trackByKey(index: number, column: TableColumn): string {
    return column.key;
  }
}
