import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Pagination component for navigating through paginated list views.
 * 
 * Provides a complete pagination UI with page numbers, next/previous buttons,
 * and item count display. Responsive design with mobile and desktop layouts.
 * 
 * @remarks
 * - Uses OnPush change detection for performance
 * - Automatically calculates visible page numbers (max 5 shown)
 * - Displays item range ("Showing X to Y of Z results")
 * - Responsive: simplified buttons on mobile, full controls on desktop
 * - Styled with Tailwind CSS
 * 
 * @example
 * ```html
 * <!-- In list component template -->
 * <app-pagination
 *   [currentPage]="page"
 *   [totalPages]="totalPages"
 *   [totalItems]="totalItems"
 *   [pageSize]="pageSize"
 *   (pageChange)="onPageChange($event)">
 * </app-pagination>
 * 
 * <!-- In list component class -->
 * page = 1;
 * totalPages = 10;
 * totalItems = 487;
 * pageSize = 50;
 * 
 * onPageChange(newPage: number) {
 *   this.page = newPage;
 *   this.loadAccounts();
 * }
 * ```
 */
@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="flex items-center justify-between px-4 py-3 bg-white border-t border-secondary-200" aria-label="Pagination">
      <div class="flex-1 flex justify-between sm:hidden">
        <button
          (click)="onPrevious()"
          [disabled]="currentPage === 1"
          aria-label="Go to previous page"
          class="relative inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
          Previous
        </button>
        <button
          (click)="onNext()"
          [disabled]="currentPage === totalPages"
          aria-label="Go to next page"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-secondary-300 text-sm font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500">
          Next
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-secondary-700" role="status" aria-live="polite">
            Showing <span class="font-medium">{{ startItem }}</span> to <span class="font-medium">{{ endItem }}</span> of
            <span class="font-medium">{{ totalItems }}</span> results
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination navigation">
            <button
              (click)="onPrevious()"
              [disabled]="currentPage === 1"
              aria-label="Previous page"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:z-10">
              <span aria-hidden="true">‹</span>
            </button>
            <button
              *ngFor="let page of visiblePages; trackBy: trackByIndex"
              (click)="onPageChange(page)"
              [attr.aria-label]="'Go to page ' + page"
              [attr.aria-current]="page === currentPage ? 'page' : null"
              [class.bg-primary-50]="page === currentPage"
              [class.border-primary-500]="page === currentPage"
              [class.text-primary-600]="page === currentPage"
              class="relative inline-flex items-center px-4 py-2 border border-secondary-300 bg-white text-sm font-medium text-secondary-700 hover:bg-secondary-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:z-10">
              {{ page }}
            </button>
            <button
              (click)="onNext()"
              [disabled]="currentPage === totalPages"
              aria-label="Next page"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-secondary-300 bg-white text-sm font-medium text-secondary-500 hover:bg-secondary-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:z-10">
              <span aria-hidden="true">›</span>
            </button>
          </nav>
        </div>
      </div>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() totalPages = 1;
  @Input() totalItems = 0;
  @Input() pageSize = 50;
  @Output() pageChange = new EventEmitter<number>();

  get startItem(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endItem(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  get visiblePages(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  /**
   * Navigates to a specific page.
   * 
   * Validates the page number is within bounds before emitting.
   * 
   * @param page - The page number to navigate to (1-indexed)
   * @internal
   */
  onPageChange(page: number): void {
    if (page !== this.currentPage && page >= 1 && page <= this.totalPages) {
      this.pageChange.emit(page);
    }
  }

  /**
   * Navigates to the previous page.
   * 
   * Only navigates if not on the first page.
   * 
   * @internal
   */
  onPrevious(): void {
    if (this.currentPage > 1) {
      this.pageChange.emit(this.currentPage - 1);
    }
  }

  /**
   * Navigates to the next page.
   * 
   * Only navigates if not on the last page.
   * 
   * @internal
   */
  onNext(): void {
    if (this.currentPage < this.totalPages) {
      this.pageChange.emit(this.currentPage + 1);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}
