import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Tenant } from '../models/tenant.model';

/**
 * Service for managing the current tenant context across the application.
 * 
 * Provides a centralized store for the currently selected tenant and exposes
 * both synchronous and observable access to tenant data. Essential for enforcing
 * multi-tenancy and data isolation throughout the application.
 * 
 * @remarks
 * This is a singleton service provided at root level. The tenant context should be
 * set after authentication and cleared on logout. All API services should use this
 * service to obtain the current tenant ID for requests.
 * 
 * @example
 * ```typescript
 * // Set tenant after login
 * tenantService.setCurrentTenant({ id: 'tenant-123', name: 'Acme Corp', status: TenantStatus.Active });
 * 
 * // Get tenant ID for API call
 * const tenantId = tenantService.getCurrentTenantId();
 * 
 * // Subscribe to tenant changes
 * tenantService.currentTenant$.subscribe(tenant => {
 *   console.log('Current tenant:', tenant);
 * });
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class TenantService {
  private currentTenantSubject: BehaviorSubject<Tenant | null>;
  public currentTenant$: Observable<Tenant | null>;

  constructor() {
    // Initialize with null, will be set after authentication
    this.currentTenantSubject = new BehaviorSubject<Tenant | null>(null);
    this.currentTenant$ = this.currentTenantSubject.asObservable();
  }

  /**
   * Gets the current tenant ID.
   * 
   * @returns The UUID of the currently selected tenant
   * @throws {Error} If tenant context is not set (user not authenticated)
   * 
   * @example
   * ```typescript
   * try {
 *   const tenantId = tenantService.getCurrentTenantId();
 *   // Use tenant ID for API call
 * } catch (error) {
 *   // Handle case where tenant is not set
 * }
 * ```
   */
  getCurrentTenantId(): string {
    const tenant = this.currentTenantSubject.value;
    if (!tenant) {
      throw new Error('Tenant context not set. User must be authenticated first.');
    }
    return tenant.id;
  }

  /**
   * Gets the current tenant object.
   * 
   * @returns The current tenant or null if not set
   * 
   * @example
   * ```typescript
   * const tenant = tenantService.getCurrentTenant();
   * if (tenant) {
   *   console.log(`Current tenant: ${tenant.name}`);
   * }
   * ```
   */
  getCurrentTenant(): Tenant | null {
    return this.currentTenantSubject.value;
  }

  /**
   * Sets the current tenant context.
   * 
   * Should be called after successful authentication when the user's tenant is determined.
   * Triggers updates to all subscribers of currentTenant$ observable.
   * 
   * @param tenant - The tenant object to set as current
   * 
   * @example
   * ```typescript
   * // After successful login
   * authService.login(credentials).subscribe(response => {
   *   tenantService.setCurrentTenant(response.tenant);
   * });
   * ```
   */
  setCurrentTenant(tenant: Tenant): void {
    this.currentTenantSubject.next(tenant);
  }

  /**
   * Clears the current tenant context.
   * 
   * Should be called during logout to reset tenant state and prevent data leakage.
   * Sets the tenant to null and notifies all subscribers.
   * 
   * @example
   * ```typescript
   * // During logout
   * authService.logout().subscribe(() => {
   *   tenantService.clearCurrentTenant();
   *   router.navigate(['/login']);
   * });
   * ```
   */
  clearCurrentTenant(): void {
    this.currentTenantSubject.next(null);
  }

  /**
   * Checks if a tenant context is currently set.
   * 
   * @returns True if a tenant is set, false otherwise
   * 
   * @example
   * ```typescript
   * if (tenantService.hasTenant()) {
   *   // Safe to make API calls
   * } else {
   *   // Redirect to tenant selection
   * }
   * ```
   */
  hasTenant(): boolean {
    return this.currentTenantSubject.value !== null;
  }
}
