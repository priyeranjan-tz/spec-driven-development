import { Pipe, PipeTransform } from '@angular/core';

/**
 * Date formatting pipe for ISO 8601 timestamp strings.
 * 
 * Converts backend ISO 8601 date/time strings into user-friendly display formats
 * using browser locale. Supports multiple format options and gracefully handles
 * invalid or null dates.
 * 
 * @remarks
 * - All dates from the API are in ISO 8601 format (e.g., "2026-01-15T14:30:00Z")
 * - Uses browser's locale for formatting (defaults to en-US)
 * - Returns em-dash (—) for null/undefined/invalid dates
 * - Timezone conversion handled automatically by browser
 * 
 * @example
 * ```html
 * <!-- Long format (default) -->
 * <span>{{ invoice.issuedAt | dateFormat }}</span>
 * <!-- Output: "Jan 15, 2026, 2:30 PM" -->
 * 
 * <!-- Short format -->
 * <span>{{ invoice.dueDate | dateFormat:'short' }}</span>
 * <!-- Output: "01/15/2026" -->
 * 
 * <!-- Date only -->
 * <span>{{ invoice.billingPeriodStart | dateFormat:'date' }}</span>
 * <!-- Output: "Jan 15, 2026" -->
 * 
 * <!-- Time only -->
 * <span>{{ entry.createdAt | dateFormat:'time' }}</span>
 * <!-- Output: "2:30 PM" -->
 * 
 * <!-- Null handling -->
 * <span>{{ invoice.paidAt | dateFormat }}</span>
 * <!-- Output: "—" (if paidAt is null) -->
 * ```
 */
@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  /**
   * Transforms ISO 8601 date strings into formatted date/time strings.
   * 
   * @param isoString - The ISO 8601 date string to format (e.g., "2026-01-15T14:30:00Z")
   * @param format - The output format (default: 'long')
   *   - 'short': MM/DD/YYYY (e.g., "01/15/2026")
   *   - 'date': Month DD, YYYY (e.g., "Jan 15, 2026")
   *   - 'time': H:MM AM/PM (e.g., "2:30 PM")
   *   - 'long': Month DD, YYYY, H:MM AM/PM (e.g., "Jan 15, 2026, 2:30 PM")
   * @returns Formatted date string or em-dash for null/invalid dates
   * 
   * @example
   * ```typescript
   * transform('2026-01-15T14:30:00Z', 'long');
   * // Returns: "Jan 15, 2026, 2:30 PM"
   * 
   * transform('2026-01-15T00:00:00Z', 'short');
   * // Returns: "01/15/2026"
   * 
   * transform('2026-01-15T14:30:00Z', 'date');
   * // Returns: "Jan 15, 2026"
   * 
   * transform('2026-01-15T14:30:00Z', 'time');
   * // Returns: "2:30 PM"
   * 
   * transform(null, 'long');
   * // Returns: "—"
   * 
   * transform('invalid-date', 'long');
   * // Returns: "—"
   * ```
   */
  transform(isoString: string | null | undefined, format: 'short' | 'long' | 'date' | 'time' = 'long'): string {
    if (!isoString) {
      return '—';
    }

    try {
      const date = new Date(isoString);
      
      if (isNaN(date.getTime())) {
        return '—';
      }

      switch (format) {
        case 'short':
          // MM/DD/YYYY
          return date.toLocaleDateString('en-US', {
            month: '2-digit',
            day: '2-digit',
            year: 'numeric'
          });
        case 'date':
          // Jan 15, 2026
          return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          });
        case 'time':
          // 3:45 PM
          return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit'
          });
        case 'long':
        default:
          // Jan 15, 2026, 3:45 PM
          return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          });
      }
    } catch (error) {
      console.error('DateFormatPipe error:', error);
      return '—';
    }
  }
}
