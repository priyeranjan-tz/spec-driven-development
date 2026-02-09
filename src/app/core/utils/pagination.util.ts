import { signal, Signal, WritableSignal } from '@angular/core';
import { PAGINATION_CONFIG } from '../constants/app.constants';
import { PaginationMetadata } from '../models/api-response';

/**
 * Pagination state management utility.
 * 
 * Provides a standardized way to manage pagination state across list components,
 * reducing duplication and ensuring consistent behavior.
 */
export interface PaginationState {
  currentPage: WritableSignal<number>;
  pageSize: WritableSignal<number>;
  totalItems: WritableSignal<number>;
  totalPages: WritableSignal<number>;
  hasNext: WritableSignal<boolean>;
  hasPrevious: WritableSignal<boolean>;
}

/**
 * Creates pagination state signals with default values.
 * 
 * @returns Object containing all pagination-related signals
 * 
 * @example
 * ```typescript
 * export class MyListComponent {
 *   pagination = createPaginationState();
 *   
 *   loadData() {
 *     api.getData(this.pagination.currentPage()).subscribe(response => {
 *       updatePaginationFromResponse(this.pagination, response.pagination);
 *     });
 *   }
 * }
 * ```
 */
export function createPaginationState(): PaginationState {
  return {
    currentPage: signal(PAGINATION_CONFIG.DEFAULT_PAGE),
    pageSize: signal(PAGINATION_CONFIG.DEFAULT_PAGE_SIZE),
    totalItems: signal(0),
    totalPages: signal(0),
    hasNext: signal(false),
    hasPrevious: signal(false)
  };
}

/**
 * Updates pagination state from an API response.
 * 
 * @param state - The pagination state to update
 * @param metadata - The pagination metadata from the API response
 * 
 * @example
 * ```typescript
 * api.getData(...).subscribe(response => {
 *   updatePaginationFromResponse(this.pagination, response.pagination);
 * });
 * ```
 */
export function updatePaginationFromResponse(
  state: PaginationState,
  metadata: PaginationMetadata
): void {
  if (!metadata) {
    return;
  }
  state.totalItems.set(metadata.totalItems);
  state.totalPages.set(metadata.totalPages);
  state.hasNext.set(metadata.hasNext);
  state.hasPrevious.set(metadata.hasPrevious);
}

/**
 * Resets pagination to the first page.
 * 
 * Useful when filters change or when resetting the view.
 * 
 * @param state - The pagination state to reset
 * 
 * @example
 * ```typescript
 * onFilterChange() {
 *   resetToFirstPage(this.pagination);
 *   this.loadData();
 * }
 * ```
 */
export function resetToFirstPage(state: PaginationState): void {
  state.currentPage.set(PAGINATION_CONFIG.DEFAULT_PAGE);
}
