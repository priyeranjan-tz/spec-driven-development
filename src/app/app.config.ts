import { ApplicationConfig, provideBrowserGlobalErrorListeners, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { tenantInterceptor, correlationIdInterceptor, errorInterceptor } from './core/services/http-interceptor.service';
import { csrfInterceptor, securityHeadersInterceptor } from './core/services/security-interceptors.service';
import { GlobalErrorHandler } from './core/services/error-handler.service';
import { TenantService } from './core/services/tenant.service';
import { TenantStatus } from './core/models/tenant.model';
import { environment } from '../environments/environment';

/**
 * Initialize default tenant for development
 * TODO: Remove this when authentication is implemented
 */
function initializeDevTenant(tenantService: TenantService) {
  return () => {
    // Set a default tenant for development (always, since guards are disabled)
    tenantService.setCurrentTenant({
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Development Tenant',
      status: TenantStatus.Active
    });
    console.log('Development tenant initialized:', '11111111-1111-1111-1111-111111111111');
  };
}

/**
 * Application configuration with providers
 * 
 * Configures routing, HTTP client with security interceptors, and global error handler.
 * 
 * @remarks
 * Interceptor order is critical for security:
 * 1. csrfInterceptor - Adds CSRF tokens to state-changing requests (must be first)
 * 2. securityHeadersInterceptor - Adds security headers to all requests
 * 3. correlationIdInterceptor - Adds correlation ID for tracing
 * 4. tenantInterceptor - Adds tenant context for multi-tenancy
 * 5. errorInterceptor - Handles errors uniformly (must be last)
 * 
 * Security features enabled:
 * - CSRF protection via Double Submit Cookie pattern
 * - Security headers (X-Content-Type-Options, X-Frame-Options, etc.)
 * - Request correlation for audit trails
 * - Tenant isolation
 * - Centralized error handling with sanitization
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        csrfInterceptor,              // CSRF protection - must be first
        securityHeadersInterceptor,   // Security headers
        correlationIdInterceptor,     // Request tracing
        tenantInterceptor,             // Multi-tenancy
        errorInterceptor               // Error handling - must be last
      ])
    ),
    { provide: ErrorHandler, useClass: GlobalErrorHandler },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeDevTenant,
      deps: [TenantService],
      multi: true
    }
  ]
};
