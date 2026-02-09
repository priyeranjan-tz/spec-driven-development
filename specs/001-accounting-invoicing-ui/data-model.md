# Data Model: Accounting & Invoicing UI

**Feature**: Accounting & Invoicing UI  
**Branch**: 001-accounting-invoicing-ui  
**Date**: 2026-02-06  
**Phase**: 1 (Design & Contracts)

## Overview

This document defines the frontend data models (TypeScript interfaces) for the Accounting & Invoicing UI. These models represent the structure of data received from the backend Dual-Entry Accounting Service API and displayed in the UI. All models are immutable on the frontend (read-only except for invoice metadata).

## Entity Relationships

```
Tenant (1) ──── (N) Account
                  │
                  ├── (N) LedgerEntry
                  └── (N) Invoice ──── (N) InvoiceLineItem
```

---

## Core Entities

### 1. Tenant

**Description**: Organizational boundary for data isolation. All accounts, ledger entries, and invoices belong to a single tenant.

```typescript
interface Tenant {
  id: string;                    // UUID
  name: string;                  // Organization name
  status: 'active' | 'inactive'; // Tenant status
}
```

**Validation Rules**:
- `id`: Required, UUID format
- `name`: Required, 1-200 characters
- `status`: Required, enum value

**Relationships**:
- One tenant has many accounts
- Tenant context is established at authentication and propagated via HTTP headers

**State Management**:
- Stored in TenantService (singleton, provided in root)
- Set once at login, immutable during session
- Used for tenant isolation enforcement

---

### 2. Account

**Description**: Represents the financially responsible entity (Organization or Individual) with ledger entries and invoices.

```typescript
interface Account {
  id: string;                              // UUID
  tenantId: string;                        // Foreign key to Tenant
  name: string;                            // Account name (e.g., "General Hospital", "John Doe")
  type: AccountType;                       // Organization or Individual
  currentBalance: number;                  // USD cents (e.g., 1050 = $10.50)
  lastInvoiceDate: string | null;          // ISO 8601 date string or null if no invoices
  status: AccountStatus;                   // Active, Suspended, Closed
  createdAt: string;                       // ISO 8601 timestamp
  updatedAt: string;                       // ISO 8601 timestamp
}

enum AccountType {
  Organization = 'organization',
  Individual = 'individual'
}

enum AccountStatus {
  Active = 'active',
  Suspended = 'suspended',
  Closed = 'closed'
}
```

**Validation Rules**:
- `id`: Required, UUID format
- `tenantId`: Required, UUID format
- `name`: Required, 1-200 characters
- `type`: Required, valid enum value
- `currentBalance`: Required, integer (cents), can be negative
- `lastInvoiceDate`: Optional, ISO 8601 date if present
- `status`: Required, valid enum value
- `createdAt`, `updatedAt`: Required, ISO 8601 timestamp

**Relationships**:
- Belongs to one tenant
- Has many ledger entries
- Has many invoices

**UI Display**:
- List view: name, type, current balance (formatted as USD), last invoice date, status
- Detail view: All fields + tabs for Summary, Transactions, Invoices

**State Transitions**:
- Read-only in UI (no account editing in this feature)
- Balance updates via backend ledger entries only

---

### 3. LedgerEntry

**Description**: Immutable system-generated transaction record representing a Ride charge or Payment.

```typescript
interface LedgerEntry {
  id: string;                              // UUID
  accountId: string;                       // Foreign key to Account
  postingDate: string;                     // ISO 8601 timestamp
  sourceType: SourceType;                  // Ride or Payment
  sourceReferenceId: string;               // Ride ID or Payment ID
  debitAmount: number;                     // USD cents (positive for charges)
  creditAmount: number;                    // USD cents (positive for payments)
  runningBalance: number;                  // USD cents after this entry
  linkedInvoiceId: string | null;          // Foreign key to Invoice (if applicable)
  metadata: Record<string, unknown>;       // Additional contextual data
  createdAt: string;                       // ISO 8601 timestamp
}

enum SourceType {
  Ride = 'ride',
  Payment = 'payment'
}
```

**Validation Rules**:
- `id`: Required, UUID format
- `accountId`: Required, UUID format
- `postingDate`: Required, ISO 8601 timestamp
- `sourceType`: Required, valid enum value
- `sourceReferenceId`: Required, UUID or reference string
- `debitAmount`: Required, integer (cents), >= 0
- `creditAmount`: Required, integer (cents), >= 0
- `runningBalance`: Required, integer (cents), can be negative
- `linkedInvoiceId`: Optional, UUID if present
- `metadata`: Optional, JSON object
- `createdAt`: Required, ISO 8601 timestamp

**Invariants**:
- Exactly one of `debitAmount` or `creditAmount` must be > 0 (not both)
- `runningBalance` = previous balance + creditAmount - debitAmount

**Relationships**:
- Belongs to one account
- May link to one invoice
- References external Ride or Payment entity

**UI Display**:
- List view: posting date, source type, source reference ID, debit/credit amounts, running balance
- Detail view: All fields + link to Ride/Payment reference + link to invoice (if applicable)
- Filters: date range, source type, amount range

**State Management**:
- Read-only in UI (no editing, deleting, or reposting)
- Displayed from API responses, no client-side mutation

---

### 4. Invoice

**Description**: Backend-generated billing document with line items, payments applied, and audit timestamps. Financially immutable but allows metadata editing.

```typescript
interface Invoice {
  id: string;                              // UUID
  accountId: string;                       // Foreign key to Account
  invoiceNumber: string;                   // Human-readable invoice number (e.g., "INV-2024-001")
  billingPeriodStart: string;              // ISO 8601 date
  billingPeriodEnd: string;                // ISO 8601 date
  frequency: InvoiceFrequency;             // Per Ride, Daily, Weekly, Monthly
  lineItems: InvoiceLineItem[];            // Array of line items
  subtotal: number;                        // USD cents (sum of line items)
  paymentsApplied: number;                 // USD cents (total payments)
  outstandingAmount: number;               // USD cents (subtotal - payments)
  status: InvoiceStatus;                   // Draft, Issued, Paid, Overdue, Cancelled
  
  // Metadata (editable)
  notes: string | null;                    // Invoice notes
 internalReference: string | null;        // Internal reference number
  billingContactName: string | null;       // Billing contact name
  billingContactEmail: string | null;      // Billing contact email
  
  // Audit fields
  generatedBy: string;                     // "system" or user ID
  createdAt: string;                       // ISO 8601 timestamp
  lastMetadataUpdate: string | null;       // ISO 8601 timestamp of last metadata edit
}

enum InvoiceFrequency {
  PerRide = 'per_ride',
  Daily = 'daily',
  Weekly = 'weekly',
  Monthly = 'monthly'
}

enum InvoiceStatus {
  Draft = 'draft',
  Issued = 'issued',
  Paid = 'paid',
  Overdue = 'overdue',
  Cancelled = 'cancelled'
}

interface InvoiceLineItem {
  id: string;                              // UUID
  rideId: string;                          // Foreign key to Ride
  serviceDate: string;                     // ISO 8601 date
  fare: number;                            // USD cents
  description: string;                     // Line item description (e.g., "Ride from A to B")
}
```

**Validation Rules**:
- `id`: Required, UUID format
- `accountId`: Required, UUID format
- `invoiceNumber`: Required, unique, pattern "INV-YYYY-NNN"
- `billingPeriodStart`: Required, ISO 8601 date
- `billingPeriodEnd`: Required, ISO 8601 date, >= billingPeriodStart
- `frequency`: Required, valid enum value
- `lineItems`: Required, array with >= 1 item
- `subtotal`: Required, integer (cents), >= 0, must equal sum of line items
- `paymentsApplied`: Required, integer (cents), >= 0
- `outstandingAmount`: Required, integer (cents), can be negative, must equal subtotal - paymentsApplied
- `status`: Required, valid enum value
- `notes`: Optional, max 1000 characters
- `internalReference`: Optional, max 100 characters
- `billingContactName`: Optional, max 200 characters
- `billingContactEmail`: Optional, valid email format
- `generatedBy`: Required, string
- `createdAt`: Required, ISO 8601 timestamp
- `lastMetadataUpdate`: Optional, ISO 8601 timestamp

**Relationships**:
- Belongs to one account
- Has many line items (embedded)
- References many ledger entries (via line items → rides)

**Editable Fields** (metadata only):
- `notes`
- `internalReference`
- `billingContactName`
- `billingContactEmail`

**Non-Editable Fields** (financially immutable):
- All other fields (amounts, line items, payments, dates)

**UI Display**:
- List view: invoice number, billing period, frequency, total amount, amount paid, outstanding amount, status
- Detail view: All fields + line items table + payments section + audit info
- Edit mode: Show editable metadata fields, disable financial fields

**State Transitions**:
- Metadata edits trigger PUT /api/invoices/{id}/metadata
- Financial data is read-only (backend authoritative)

---

## Supporting Types

### Date Range Filter

```typescript
interface DateRangeFilter {
  startDate: string | null;  // ISO 8601 date or null (no start bound)
  endDate: string | null;    // ISO 8601 date or null (no end bound)
}
```

### Amount Range Filter

```typescript
interface AmountRangeFilter {
  minAmount: number | null;  // USD cents or null (no minimum)
  maxAmount: number | null;  // USD cents or null (no maximum)
}
```

### Pagination

```typescript
interface PaginationParams {
  page: number;              // 1-indexed
  pageSize: number;          // Items per page (default 50)
}

interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

### API Error Response

```typescript
interface ApiError {
  statusCode: number;        // HTTP status code
  message: string;           // User-friendly error message
  errorCode: string;         // Machine-readable error code (e.g., "TENANT_NOT_FOUND")
  details: Record<string, unknown> | null;  // Additional error details
  timestamp: string;         // ISO 8601 timestamp
  correlationId: string;     // X-Correlation-ID for tracing
}
```

---

## Formatting Utilities

### Currency Formatting

```typescript
// Converts cents to USD string
function formatCurrency(cents: number): string {
  const dollars = cents / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(dollars);
}

// Example: formatCurrency(1050) => "$10.50"
```

### Date Formatting

```typescript
// Converts ISO 8601 to display date
function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(isoString));
}

// Example: formatDate("2024-01-15T00:00:00Z") => "Jan 15, 2024"
```

---

## Summary

**Total Entities**: 4 core (Tenant, Account, LedgerEntry, Invoice)  
**Total Enums**: 4 (AccountType, AccountStatus, SourceType, InvoiceFrequency, InvoiceStatus)  
**Editable Entities**: Invoice metadata only (4 fields)  
**Read-Only Entities**: All others  
**Validation**: TypeScript strict mode + runtime API response validation  
**Currency**: USD cents (integer) throughout backend, formatted to USD string for display

All models align with:
- Constitution Type Safety requirements (strict TypeScript, no any)
- Feature specification Key Entities section
- Backend API contracts (to be defined in contracts/)
