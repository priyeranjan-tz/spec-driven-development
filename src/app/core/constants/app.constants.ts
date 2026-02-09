import { environment } from '../../../environments/environment';

/**
 * Application-wide constants for configuration values.
 * 
 * Centralizes magic numbers, strings, and configuration to avoid duplication
 * and make maintenance easier.
 */

/**
 * API configuration constants
 */
export const API_CONFIG = {
  /** Base URL for all API requests */
  BASE_URL: environment.apiUrl,
  /** Number of retry attempts for failed requests */
  RETRY_COUNT: 2,
  /** Delay in milliseconds between retry attempts */
  RETRY_DELAY: 1000
} as const;

/**
 * Pagination configuration constants
 */
export const PAGINATION_CONFIG = {
  /** Default page number for list views */
  DEFAULT_PAGE: 1,
  /** Default number of items per page */
  DEFAULT_PAGE_SIZE: 50,
  /** Maximum allowed page size */
  MAX_PAGE_SIZE: 100
} as const;

/**
 * Form validation constants
 */
export const VALIDATION_LIMITS = {
  /** Maximum length for invoice notes field */
  INVOICE_NOTES_MAX_LENGTH: 1000,
  /** Maximum length for invoice internal reference field */
  INVOICE_INTERNAL_REF_MAX_LENGTH: 100,
  /** Maximum length for general text fields */
  TEXT_FIELD_MAX_LENGTH: 255
} as const;

/**
 * UI timeout constants (in milliseconds)
 */
export const UI_TIMEOUTS = {
  /** How long to show success messages */
  SUCCESS_MESSAGE: 3000,
  /** Debounce delay for search inputs */
  SEARCH_DEBOUNCE: 300
} as const;

/**
 * Status badge CSS classes for different entity statuses
 */
export const STATUS_CLASSES = {
  // Invoice statuses
  INVOICE_DRAFT: 'bg-gray-100 text-gray-800',
  INVOICE_ISSUED: 'bg-blue-100 text-blue-800',
  INVOICE_PAID: 'bg-green-100 text-green-800',
  INVOICE_OVERDUE: 'bg-red-100 text-red-800',
  INVOICE_CANCELLED: 'bg-gray-100 text-gray-500',
  
  // Account statuses
  ACCOUNT_ACTIVE: 'bg-green-100 text-green-800',
  ACCOUNT_SUSPENDED: 'bg-yellow-100 text-yellow-800',
  ACCOUNT_CLOSED: 'bg-gray-100 text-gray-500',
  
  // Default fallback
  DEFAULT: 'bg-gray-100 text-gray-800'
} as const;
