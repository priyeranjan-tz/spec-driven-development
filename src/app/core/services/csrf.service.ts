import { Injectable } from '@angular/core';

/**
 * CSRF Token Management Service
 * 
 * Manages CSRF (Cross-Site Request Forgery) token lifecycle for state-changing HTTP requests.
 * Tokens should be set by backend in httpOnly cookies and read from headers for subsequent requests.
 * 
 * @remarks
 * The backend must:
 * 1. Set CSRF token in httpOnly cookie (XSRF-TOKEN)
 * 2. Validate X-XSRF-TOKEN header on POST/PUT/PATCH/DELETE requests
 * 3. Rotate tokens periodically for enhanced security
 * 
 * This follows the Double Submit Cookie pattern recommended by OWASP.
 * 
 * @example
 * ```typescript
 * // Backend sets cookie (httpOnly, SameSite=Strict):
 * // Set-Cookie: XSRF-TOKEN=abc123; HttpOnly; Secure; SameSite=Strict
 * 
 * // Frontend reads and sends in header:
 * // X-XSRF-TOKEN: abc123
 * ```
 */
@Injectable({
  providedIn: 'root'
})
export class CsrfService {
  private readonly CSRF_COOKIE_NAME = 'XSRF-TOKEN';
  private readonly CSRF_HEADER_NAME = 'X-XSRF-TOKEN';

  /**
   * Retrieves the CSRF token from cookies.
   * 
   * @returns The CSRF token string or null if not present
   * 
   * @remarks
   * The token is set by the backend in an httpOnly cookie for initial requests.
   * Angular's HttpClient can automatically handle CSRF tokens, but this provides
   * explicit control for custom implementations.
   */
  getCsrfToken(): string | null {
    const name = this.CSRF_COOKIE_NAME + '=';
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(name) === 0) {
        return cookie.substring(name.length);
      }
    }

    return null;
  }

  /**
   * Gets the header name for CSRF token.
   * 
   * @returns The standard CSRF header name
   */
  getCsrfHeaderName(): string {
    return this.CSRF_HEADER_NAME;
  }

  /**
   * Checks if a request requires CSRF protection.
   * 
   * State-changing methods (POST, PUT, PATCH, DELETE) require CSRF tokens
   * to prevent cross-site request forgery attacks.
   * 
   * @param method - HTTP method of the request
   * @returns True if CSRF token is required for this method
   */
  requiresCsrfToken(method: string): boolean {
    const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    return stateChangingMethods.includes(method.toUpperCase());
  }
}
