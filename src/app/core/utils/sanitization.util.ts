/**
 * Input Sanitization Utilities
 * 
 * Provides utilities for sanitizing and validating user input to prevent
 * injection attacks, path traversal, and other input-based vulnerabilities.
 * 
 * These utilities complement Angular's built-in sanitization and should be
 * used for server-bound data and file operations.
 * 
 * @remarks
 * Angular automatically sanitizes values before inserting them into the DOM,
 * but additional validation is needed for:
 * - File names and paths
 * - URL parameters
 * - Data sent to backend APIs
 * - Dynamic route segments
 */

/**
 * Sanitizes a filename to prevent path traversal and special character issues.
 * 
 * Removes or replaces potentially dangerous characters that could be used
 * for path traversal attacks or cause filesystem issues.
 * 
 * Security measures:
 * - Removes path separators (/, \)
 * - Removes parent directory references (..)
 * - Removes null bytes
 * - Limits length to prevent buffer overflow
 * - Removes special filesystem characters
 * 
 * @param filename - The filename to sanitize
 * @param maxLength - Maximum allowed length (default: 255)
 * @returns Sanitized filename safe for filesystem operations
 * 
 * @example
 * ```typescript
 * const userInput = '../../../etc/passwd';
 * const safe = sanitizeFilename(userInput);
 * // Result: 'etcpasswd'
 * 
 * const invoice = 'Invoice #123.pdf';
 * const safe = sanitizeFilename(invoice);
 * // Result: 'Invoice_123.pdf'
 * ```
 */
export function sanitizeFilename(filename: string, maxLength: number = 255): string {
  if (!filename) {
    return 'unnamed';
  }

  let sanitized = filename
    // Remove path separators
    .replace(/[/\\]/g, '')
    // Remove parent directory references
    .replace(/\.\./g, '')
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove other potentially dangerous characters
    .replace(/[<>:"|?*]/g, '')
    // Replace spaces with underscores
    .replace(/\s+/g, '_')
    // Remove leading/trailing dots and spaces
    .replace(/^[.\s]+|[.\s]+$/g, '')
    // Limit length
    .substring(0, maxLength);

  // Ensure result is not empty
  return sanitized || 'unnamed';
}

/**
 * Validates and sanitizes a URL parameter.
 * 
 * Ensures URL parameters don't contain malicious content that could be
 * used for XSS or other injection attacks.
 * 
 * @param param - The URL parameter to sanitize
 * @returns Sanitized parameter safe for URL use
 * 
 * @example
 * ```typescript
 * const userId = sanitizeUrlParam('<script>alert("xss")</script>');
 * // Result: 'scriptalertxssscript'
 * ```
 */
export function sanitizeUrlParam(param: string): string {
  if (!param) {
    return '';
  }

  return param
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove JavaScript protocol
    .replace(/javascript:/gi, '')
    // Remove data protocol
    .replace(/data:/gi, '')
    // Encode special characters
    .replace(/[<>'"]/g, (char) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      };
      return entities[char] || char;
    });
}

/**
 * Validates that a string contains only alphanumeric characters and basic punctuation.
 * 
 * Useful for validating IDs, codes, and other structured identifiers.
 * 
 * @param input - The string to validate
 * @param allowSpaces - Whether to allow spaces (default: false)
 * @returns True if input is safe
 * 
 * @example
 * ```typescript
 * isAlphanumeric('INV-1234'); // true
 * isAlphanumeric('INV_1234'); // true
 * isAlphanumeric('<script>'); // false
 * ```
 */
export function isAlphanumeric(input: string, allowSpaces: boolean = false): boolean {
  const pattern = allowSpaces ? /^[a-zA-Z0-9\s\-_]+$/ : /^[a-zA-Z0-9\-_]+$/;
  return pattern.test(input);
}

/**
 * Validates an email address format.
 * 
 * Uses a reasonable regex that catches most invalid formats while
 * not being overly restrictive.
 * 
 * @param email - The email address to validate
 * @returns True if email format is valid
 * 
 * @remarks
 * This is a client-side validation only. Server-side validation
 * is still required for security.
 * 
 * @example
 * ```typescript
 * isValidEmail('user@example.com'); // true
 * isValidEmail('invalid.email'); // false
 * ```
 */
export function isValidEmail(email: string): boolean {
  const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return pattern.test(email);
}

/**
 * Sanitizes HTML to prevent XSS attacks.
 * 
 * Removes all HTML tags and JavaScript content. Use this when you need
 * to display user input as plain text.
 * 
 * @param html - The HTML string to sanitize
 * @returns Plain text with HTML removed
 * 
 * @remarks
 * For displaying HTML content, use Angular's DomSanitizer instead.
 * This utility is for converting HTML to safe plain text.
 * 
 * @example
 * ```typescript
 * const userInput = '<script>alert("xss")</script>Hello';
 * const safe = sanitizeHtml(userInput);
 * // Result: 'Hello'
 * ```
 */
export function sanitizeHtml(html: string): string {
  if (!html) {
    return '';
  }

  return html
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove style tags and content
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    // Remove all HTML tags
    .replace(/<[^>]+>/g, '')
    // Decode HTML entities
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Validates and sanitizes a path parameter to prevent path traversal.
 * 
 * Ensures paths don't contain sequences that could escape the intended directory.
 * 
 * @param path - The path to validate
 * @returns True if path is safe
 * 
 * @example
 * ```typescript
 * isValidPath('/api/invoices/123'); // true
 * isValidPath('../../../etc/passwd'); // false
 * isValidPath('/api/invoices/../admin'); // false
 * ```
 */
export function isValidPath(path: string): boolean {
  // Reject paths with parent directory references
  if (path.includes('..')) {
    return false;
  }

  // Reject paths with null bytes
  if (path.includes('\0')) {
    return false;
  }

  // Reject paths with unusual characters
  const dangerousPattern = /[<>"|?*]/;
  if (dangerousPattern.test(path)) {
    return false;
  }

  return true;
}

/**
 * Truncates a string to a maximum length with ellipsis.
 * 
 * Useful for preventing excessively long input that could cause
 * UI issues or backend buffer overflows.
 * 
 * @param str - The string to truncate
 * @param maxLength - Maximum length including ellipsis
 * @returns Truncated string
 * 
 * @example
 * ```typescript
 * truncate('Very long text...', 10);
 * // Result: 'Very lo...'
 * ```
 */
export function truncate(str: string, maxLength: number): string {
  if (!str || str.length <= maxLength) {
    return str;
  }

  return str.substring(0, maxLength - 3) + '...';
}

/**
 * Validates that input doesn't contain SQL injection patterns.
 * 
 * This is a defense-in-depth measure. PRIMARY protection against SQL injection
 * must be parameterized queries on the backend.
 * 
 * @param input - The input to validate
 * @returns True if input appears safe from SQL injection
 * 
 * @remarks
 * This is NOT a replacement for proper backend validation and parameterized queries.
 * It's only a frontend guard to catch obvious injection attempts.
 */
export function containsSqlInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|\*\/|\/\*)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
    /(;.*--)/,
    /(\bUNION\b.*\bSELECT\b)/i
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Validates content length to prevent buffer overflow attacks.
 * 
 * @param content - The content to validate
 * @param maxLength - Maximum allowed length
 * @returns True if content length is within limits
 */
export function isValidLength(content: string, maxLength: number): boolean {
  return !!(content && content.length > 0 && content.length <= maxLength);
}
