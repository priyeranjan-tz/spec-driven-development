/**
 * Enumeration of account types indicating the nature of the account holder.
 * 
 * Determines whether the account represents an organizational entity or an individual person.
 * This may affect billing terms, invoicing frequency, and reporting.
 * 
 * @example
 * ```typescript
 * // Organization account
 * const account: Account = {
 *   type: AccountType.Organization,
 *   name: 'General Hospital',
 *   ...
 * };
 * 
 * // Individual account
 * const account: Account = {
 *   type: AccountType.Individual,
 *   name: 'John Doe',
 *   ...
 * };
 * 
 * // Filter accounts by type
 * accountsService.getAccounts(tenantId, 1, 50, undefined, AccountType.Organization);
 * ```
 */
export enum AccountType {
  Organization = 'organization',
  Individual = 'individual'
}
