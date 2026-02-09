import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { TenantService } from '../services/tenant.service';
import { LoggerService } from '../services/logger.service';

/**
 * Route guard that ensures tenant context is set before accessing routes.
 * 
 * Validates that a tenant has been selected in the TenantService before allowing
 * navigation to protected routes. Essential for enforcing multi-tenancy and preventing
 * data leakage between tenants.
 * 
 * @param route - The activated route snapshot
 * @param state - The router state snapshot containing the target URL
 * @returns True if tenant context is set, false otherwise (triggers redirect)
 * 
 * @remarks
 * This guard should be applied to all routes that make API calls requiring tenant context.
 * Typically used in combination with authGuard to ensure both authentication and tenant
 * selection before accessing resources.
 * 
 * The tenant context is set in TenantService after successful authentication when the
 * user's tenant is determined from their credentials.
 * 
 * @example
 * ```typescript
 * // In route configuration
 * const routes: Routes = [
 *   {
 *     path: 'accounts',
 *     component: AccountListComponent,
 *     canActivate: [authGuard, tenantGuard] // Both guards required
 *   },
 *   {
 *     path: 'select-tenant',
 *     component: TenantSelectionComponent
 *     // No tenant guard - accessible before tenant selection
 *   }
 * ];
 * 
 * // In authentication flow
 * authService.login(credentials).subscribe(response => {
 *   tenantService.setCurrentTenant(response.tenant);
 *   router.navigate(['/accounts']); // Now guarded routes are accessible
 * });
 * ```
 */
export const tenantGuard: CanActivateFn = (route, state) => {
  const tenantService = inject(TenantService);
  const router = inject(Router);
  const logger = inject(LoggerService);

  if (!tenantService.hasTenant()) {
    logger.error('TenantGuard: No tenant context set, redirecting to tenant selection');
    // Redirect to tenant selection page
    router.navigate(['/select-tenant'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  return true;
};
