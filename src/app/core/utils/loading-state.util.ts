import { signal, WritableSignal } from '@angular/core';

/**
 * Loading state management utility.
 * 
 * Provides a standardized way to manage loading/error states across components,
 * reducing duplication and ensuring consistent behavior.
 */
export interface LoadingState {
  isLoading: WritableSignal<boolean>;
  error: WritableSignal<string | null>;
}

/**
 * Creates loading state signals with default values.
 * 
 * @returns Object containing loading and error signals
 * 
 * @example
 * ```typescript
 * export class MyComponent {
 *   loadingState = createLoadingState();
 *   
 *   loadData() {
 *     setLoading(this.loadingState, true);
 *     
 *     api.getData().subscribe({
 *       next: (data) => {
 *         setLoading(this.loadingState, false);
 *       },
 *       error: (err) => {
 *         setError(this.loadingState, 'Failed to load data');
 *       }
 *     });
 *   }
 * }
 * ```
 */
export function createLoadingState(): LoadingState {
  return {
    isLoading: signal(false),
    error: signal<string | null>(null)
  };
}

/**
 * Sets the loading state and clears any existing error.
 * 
 * @param state - The loading state to update
 * @param loading - Whether loading is active
 * 
 * @example
 * ```typescript
 * setLoading(this.loadingState, true);
 * api.getData()...
 * ```
 */
export function setLoading(state: LoadingState, loading: boolean): void {
  state.isLoading.set(loading);
  if (loading) {
    state.error.set(null);
  }
}

/**
 * Sets an error message and stops loading.
 * 
 * @param state - The loading state to update
 * @param errorMessage - The error message to display
 * 
 * @example
 * ```typescript
 * api.getData().subscribe({
 *   error: (err) => setError(this.loadingState, 'Failed to load data')
 * });
 * ```
 */
export function setError(state: LoadingState, errorMessage: string): void {
  state.error.set(errorMessage);
  state.isLoading.set(false);
}

/**
 * Clears both loading and error states.
 * 
 * @param state - The loading state to clear
 * 
 * @example
 * ```typescript
 * clearLoadingState(this.loadingState);
 * ```
 */
export function clearLoadingState(state: LoadingState): void {
  state.isLoading.set(false);
  state.error.set(null);
}
