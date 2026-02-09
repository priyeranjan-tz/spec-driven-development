/**
 * Production environment configuration
 */
export const environment = {
  production: true,
  apiUrl: 'http://localhost:5046',
  logLevel: 'error' as const,
  enableDetailedErrors: false,
  csrfCookieName: 'XSRF-TOKEN',
  csrfHeaderName: 'X-XSRF-TOKEN',
};


export type Environment = typeof environment;
