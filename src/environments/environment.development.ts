/**
 * Development environment configuration
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5046',
  logLevel: 'debug' as const,
  enableDetailedErrors: true,
  csrfCookieName: 'XSRF-TOKEN',
  csrfHeaderName: 'X-XSRF-TOKEN',
};

export type Environment = typeof environment;
