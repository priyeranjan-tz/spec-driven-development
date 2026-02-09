/**
 * Tenant model representing organizational boundary for data isolation
 */
export interface Tenant {
  /** Unique identifier (UUID) */
  id: string;
  /** Organization name */
  name: string;
  /** Tenant status */
  status: TenantStatus;
}

export enum TenantStatus {
  Active = 'active',
  Inactive = 'inactive'
}
