import { Pipe, PipeTransform } from '@angular/core';

/**
 * Currency formatting pipe that converts cent values to USD display format.
 * 
 * Transforms integer cent values into properly formatted dollar strings with
 * the $ symbol and optional decimal places. Handles negative values and null/undefined.
 * 
 * @remarks
 * - All financial amounts in the API are in cents (integers)
 * - Pipe converts cents to dollars for display
 * - Supports hiding cents for whole dollar amounts
 * - Properly handles negative balances (debts)
 * 
 * @example
 * ```html
 * <!-- Basic usage -->
 * <span>{{ invoice.totalCents | currencyFormat }}</span>
 * <!-- Output: "$540.00" -->
 * 
 * <!-- Negative amount -->
 * <span>{{ -15000 | currencyFormat }}</span>
 * <!-- Output: "-$150.00" -->
 * 
 * <!-- Hide cents -->
 * <span>{{ 100000 | currencyFormat:false }}</span>
 * <!-- Output: "$1,000" -->
 * 
 * <!-- Null handling -->
 * <span>{{ null | currencyFormat }}</span>
 * <!-- Output: "$0.00" -->
 * ```
 */
@Pipe({
  name: 'currencyFormat',
  standalone: true
})
export class CurrencyFormatPipe implements PipeTransform {
  /**
   * Transforms cent values into formatted USD currency strings.
   * 
   * @param cents - The amount in cents to format (null/undefined treated as 0)
   * @param showCents - Whether to display decimal places (default: true)
   * @returns Formatted currency string with $ symbol
   * 
   * @example
   * ```typescript
   * transform(54000); // Returns: "$540.00"
   * transform(54000, false); // Returns: "$540"
   * transform(-15000); // Returns: "-$150.00"
   * transform(null); // Returns: "$0.00"
   * transform(undefined, false); // Returns: "$0"
   * ```
   */
  transform(cents: number | null | undefined, showCents = true): string {
    if (cents === null || cents === undefined) {
      return '$0.00';
    }

    const dollars = cents / 100;
    const isNegative = dollars < 0;
    const absoluteDollars = Math.abs(dollars);

    if (showCents) {
      const formatted = absoluteDollars.toFixed(2);
      return isNegative ? `-$${formatted}` : `$${formatted}`;
    } else {
      const formatted = Math.round(absoluteDollars).toLocaleString();
      return isNegative ? `-$${formatted}` : `$${formatted}`;
    }
  }
}
