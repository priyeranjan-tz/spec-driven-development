---
description: "Implementation task list for Accounting & Invoicing UI"
---

# Tasks: Accounting & Invoicing UI

**Feature Branch**: `001-accounting-invoicing-ui`  
**Input**: Design documents from `/specs/001-accounting-invoicing-ui/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: This feature follows TDD (Test-First Development) as required by the constitution. All E2E tests MUST be written FIRST and FAIL before implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5, US6)
- Include exact file paths in descriptions

## Path Conventions

All paths are relative to repository root. This is a frontend-only Angular application:
- **Frontend code**: `frontend/src/app/`
- **E2E tests**: `frontend/e2e/`
- **Config files**: `frontend/` root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic Angular structure

- [X] T001 Create Angular 17+ project with standalone components in frontend/ directory using Angular CLI
- [X] T002 Install core dependencies (RxJS, Tailwind CSS, Playwright) in frontend/package.json
- [X] T003 [P] Configure TypeScript strict mode in frontend/tsconfig.json
- [X] T004 [P] Configure Tailwind CSS in frontend/tailwind.config.ts with custom theme
- [X] T005 [P] Configure ESLint in frontend/.eslintrc.cjs
- [X] T006 [P] Configure Prettier in frontend/.prettierrc
- [X] T007 [P] Configure performance budgets in frontend/angular.json (initial bundle <500KB, lazy chunks <250KB)
- [X] T008 [P] Configure Playwright in frontend/e2e/playwright.config.ts
- [X] T009 [P] Setup Tailwind imports in frontend/src/styles.css
- [X] T010 Create feature directories (accounts, transactions, invoices) in frontend/src/app/features/
- [X] T011 [P] Create core directory in frontend/src/app/core/
- [X] T012 [P] Create shared directory in frontend/src/app/shared/

**Checkpoint**: Project structure initialized with configuration files

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Core Services & Infrastructure

- [X] T013 [P] Create Tenant model in frontend/src/app/core/models/tenant.model.ts
- [X] T014 [P] Create ApiResponse model in frontend/src/app/core/models/api-response.ts
- [X] T015 [P] Create ApiError model in frontend/src/app/core/models/error.model.ts
- [X] T016 Create TenantService singleton in frontend/src/app/core/services/tenant.service.ts
- [X] T017 Unit test for TenantService in frontend/src/app/core/services/tenant.service.spec.ts
- [X] T018 Create TenantInterceptor for X-Tenant-ID header injection in frontend/src/app/core/services/http-interceptor.service.ts
- [X] T019 Create CorrelationIdInterceptor for X-Correlation-ID header in frontend/src/app/core/services/http-interceptor.service.ts
- [X] T020 Create ErrorInterceptor for centralized error handling in frontend/src/app/core/services/http-interceptor.service.ts
- [X] T021 Create GlobalErrorHandler implementing Angular ErrorHandler in frontend/src/app/core/services/error-handler.service.ts
- [X] T022 Unit test for GlobalErrorHandler in frontend/src/app/core/services/error-handler.service.spec.ts
- [X] T023 [P] Create AuthGuard in frontend/src/app/core/guards/auth.guard.ts
- [X] T024 [P] Create TenantGuard in frontend/src/app/core/guards/tenant.guard.ts

### Shared UI Components (Reusable Across All Features)

- [X] T025 [P] Create Button component with loading/disabled states in frontend/src/app/shared/components/button/
- [X] T026 [P] Unit test for Button component in frontend/src/app/shared/components/button/button.component.spec.ts
- [X] T027 [P] Create Table component with sorting support in frontend/src/app/shared/components/table/
- [X] T028 [P] Unit test for Table component in frontend/src/app/shared/components/table/table.component.spec.ts
- [X] T029 [P] Create Pagination component in frontend/src/app/shared/components/pagination/
- [X] T030 [P] Unit test for Pagination component in frontend/src/app/shared/components/pagination/pagination.component.spec.ts
- [X] T031 [P] Create EmptyState component in frontend/src/app/shared/components/empty-state/
- [X] T032 [P] Create ErrorState component with retry button in frontend/src/app/shared/components/error-state/
- [X] T033 [P] Create LoadingSpinner component in frontend/src/app/shared/components/loading-spinner/
- [X] T034 [P] Create FilterBar component in frontend/src/app/shared/components/filter-bar/

### Shared Pipes

- [X] T035 [P] Create CurrencyFormatPipe (cents to USD) in frontend/src/app/shared/pipes/currency-format.pipe.ts
- [X] T036 [P] Unit test for CurrencyFormatPipe in frontend/src/app/shared/pipes/currency-format.pipe.spec.ts
- [X] T037 [P] Create DateFormatPipe (ISO 8601 to display) in frontend/src/app/shared/pipes/date-format.pipe.ts
- [X] T038 [P] Unit test for DateFormatPipe in frontend/src/app/shared/pipes/date-format.pipe.spec.ts

### App Configuration

- [X] T039 Configure app.config.ts with HTTP interceptors and providers in frontend/src/app/app.config.ts
- [X] T040 Setup main routes with lazy loading in frontend/src/app/app.routes.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Account Selection and Navigation (Priority: P1) 🎯 MVP

**Goal**: Enable finance users to view a list of accounts and navigate to account details with tabs for Summary, Transactions, and Invoices

**Independent Test**: Authenticate as a tenant user, view account list showing all accounts with name/type/balance/status, select an account to see detail view with tabs. Delivers immediate value by showing which accounts exist and their current financial status.

### E2E Tests for User Story 1 (TDD - Write FIRST, ensure they FAIL)

- [X] T041 [P] [US1] E2E test for account list view (empty state, loading state, success state) in frontend/e2e/accounts/account-list.spec.ts
- [X] T042 [P] [US1] E2E test for account selection and navigation to detail view in frontend/e2e/accounts/account-selection.spec.ts
- [X] T043 [P] [US1] E2E test for account detail tabs (Summary, Transactions, Invoices) in frontend/e2e/accounts/account-navigation.spec.ts
- [X] T044 [P] [US1] E2E test for tenant isolation (no cross-tenant data leakage) in frontend/e2e/accounts/tenant-isolation.spec.ts

### Models for User Story 1

- [X] T045 [P] [US1] Create AccountType enum in frontend/src/app/features/accounts/models/account-type.enum.ts
- [X] T046 [P] [US1] Create AccountStatus enum in frontend/src/app/features/accounts/models/account-status.enum.ts
- [X] T047 [US1] Create Account model interface in frontend/src/app/features/accounts/models/account.model.ts

### API Service for User Story 1

- [X] T048 [US1] Implement AccountsApiService with getAccounts() and getAccount() in frontend/src/app/features/accounts/services/accounts-api.service.ts
- [X] T049 [US1] Unit test for AccountsApiService in frontend/src/app/features/accounts/services/accounts-api.service.spec.ts

### Components for User Story 1

- [X] T050 [US1] Create AccountListComponent with OnPush, loading/error/empty states, pagination in frontend/src/app/features/accounts/pages/account-list/
- [X] T051 [US1] Component test for AccountListComponent (all states: loading, error, empty, success) in frontend/src/app/features/accounts/pages/account-list/account-list.component.spec.ts
- [X] T052 [US1] Create AccountDetailComponent with tabs (Summary, Transactions, Invoices) in frontend/src/app/features/accounts/pages/account-detail/
- [X] T053 [US1] Component test for AccountDetailComponent (tab navigation, data binding) in frontend/src/app/features/accounts/pages/account-detail/account-detail.component.spec.ts
- [X] T054 [P] [US1] Create AccountCardComponent (reusable account display card) in frontend/src/app/features/accounts/components/account-card/
- [X] T055 [P] [US1] Create AccountSummaryComponent (account overview display) in frontend/src/app/features/accounts/components/account-summary/

### Routes for User Story 1

- [X] T056 [US1] Configure accounts routes (list, detail with :accountId param, lazy-loaded) in frontend/src/app/features/accounts/accounts.routes.ts
- [X] T057 [US1] Export accounts feature via index.ts in frontend/src/app/features/accounts/index.ts

### Integration for User Story 1

- [X] T058 [US1] Integrate accounts routes into main app.routes.ts with lazy loading
- [X] T059 [US1] Add navigation link to accounts in main app navigation
- [X] T060 [US1] Verify E2E tests now PASS for User Story 1

**Checkpoint**: User Story 1 complete - users can view accounts and navigate to detail pages. This is the MVP foundation.

---

## Phase 4: User Story 2 - Transaction Ledger Review (Priority: P1)

**Goal**: Enable users to review all financial transactions for an account with date range and source type filters, view transaction details, and see running balance

**Independent Test**: Select an account, navigate to Transactions tab, view ledger entries with posting date/source/amounts/running balance, apply filters by date range and source type, click a transaction to see detail view. Delivers complete financial transaction visibility.

### E2E Tests for User Story 2 (TDD - Write FIRST, ensure they FAIL)

- [X] T061 [P] [US2] E2E test for transaction ledger list view (empty, loading, success states) in frontend/e2e/transactions/ledger-review.spec.ts
- [X] T062 [P] [US2] E2E test for transaction filters (date range, source type) in frontend/e2e/transactions/transaction-filters.spec.ts
- [X] T063 [P] [US2] E2E test for transaction detail view with cross-reference links in frontend/e2e/transactions/transaction-detail.spec.ts
- [X] T064 [P] [US2] E2E test for performance requirement (<2s load for 90 days, 1000 entries) in frontend/e2e/transactions/ledger-performance.spec.ts

### Models for User Story 2

- [X] T065 [P] [US2] Create SourceType enum (Ride, Payment) in frontend/src/app/features/transactions/models/source-type.enum.ts
- [X] T066 [US2] Create LedgerEntry model interface in frontend/src/app/features/transactions/models/ledger-entry.model.ts

### API Service for User Story 2

- [X] T067 [US2] Implement TransactionsApiService with getLedgerEntries() (with filters) and getLedgerEntry() in frontend/src/app/features/transactions/services/transactions-api.service.ts
- [X] T068 [US2] Unit test for TransactionsApiService in frontend/src/app/features/transactions/services/transactions-api.service.spec.ts

### Components for User Story 2

- [X] T069 [US2] Create TransactionListComponent with OnPush, filters UI, loading/error/empty states, pagination, trackBy in frontend/src/app/features/transactions/pages/transaction-list/
- [X] T070 [US2] Component test for TransactionListComponent (all states, filter application) in frontend/src/app/features/transactions/pages/transaction-list/transaction-list.component.spec.ts
- [X] T071 [US2] Create TransactionDetailComponent displaying full ledger entry metadata in frontend/src/app/features/transactions/pages/transaction-detail/
- [X] T072 [US2] Component test for TransactionDetailComponent in frontend/src/app/features/transactions/pages/transaction-detail/transaction-detail.component.spec.ts
- [X] T073 [P] [US2] Create TransactionRowComponent (reusable ledger entry row) in frontend/src/app/features/transactions/components/transaction-row/
- [X] T074 [P] [US2] Create TransactionFiltersComponent (date range, source type, amount range) in frontend/src/app/features/transactions/components/transaction-filters/
- [X] T075 [P] [US2] Create RunningBalanceDisplayComponent in frontend/src/app/features/transactions/components/running-balance-display/

### Routes for User Story 2

- [X] T076 [US2] Configure transactions routes (list with accountId, detail with ledgerEntryId) in frontend/src/app/features/transactions/transactions.routes.ts
- [X] T077 [US2] Export transactions feature via index.ts in frontend/src/app/features/transactions/index.ts

### Integration for User Story 2

- [X] T078 [US2] Integrate transactions routes as child routes of account detail (Transactions tab)
- [X] T079 [US2] Add read-only indicators to prevent edit/delete attempts in UI
- [X] T080 [US2] Verify E2E tests now PASS for User Story 2

**Checkpoint**: User Story 2 complete - users can review full ledger with filters. Core P1 financial review capability delivered.

---

## Phase 5: User Story 3 - Invoice List and Search (Priority: P2)

**Goal**: Enable users to view all invoices for an account with sorting and filtering capabilities

**Independent Test**: Select an account, navigate to Invoices tab, view invoice list showing invoice number/billing period/frequency/amounts/status, sort by columns, search/filter invoices. Delivers complete invoice visibility.

### E2E Tests for User Story 3 (TDD - Write FIRST, ensure they FAIL)

- [X] T081 [P] [US3] E2E test for invoice list view (empty, loading, success states) in frontend/e2e/invoices/invoice-list.spec.ts
- [X] T082 [P] [US3] E2E test for invoice sorting (by date, amount, status) in frontend/e2e/invoices/invoice-sorting.spec.ts
- [X] T083 [P] [US3] E2E test for invoice filtering (by status, frequency) in frontend/e2e/invoices/invoice-filtering.spec.ts
- [X] T084 [P] [US3] E2E test for performance requirement (<1s load for 500 invoices) in frontend/e2e/invoices/invoice-list-performance.spec.ts

### Models for User Story 3

- [X] T085 [P] [US3] Create InvoiceFrequency enum (PerRide, Daily, Weekly, Monthly) in frontend/src/app/features/invoices/models/invoice-frequency.enum.ts
- [X] T086 [P] [US3] Create InvoiceStatus enum (Draft, Issued, Paid, Overdue, Cancelled) in frontend/src/app/features/invoices/models/invoice-status.enum.ts
- [X] T087 [US3] Create Invoice model interface (without line items initially) in frontend/src/app/features/invoices/models/invoice.model.ts

### API Service for User Story 3

- [X] T088 [US3] Implement InvoicesApiService with getInvoices() (with filters/sorting) in frontend/src/app/features/invoices/services/invoices-api.service.ts
- [X] T089 [US3] Unit test for InvoicesApiService in frontend/src/app/features/invoices/services/invoices-api.service.spec.ts

### Components for User Story 3

- [X] T090 [US3] Create InvoiceListComponent with OnPush, sorting, filtering, loading/error/empty states, pagination, trackBy in frontend/src/app/features/invoices/pages/invoice-list/
- [X] T091 [US3] Component test for InvoiceListComponent (all states, sorting, filtering) in frontend/src/app/features/invoices/pages/invoice-list/invoice-list.component.spec.ts
- [X] T092 [P] [US3] Create InvoiceCardComponent (reusable invoice display card) in frontend/src/app/features/invoices/components/invoice-card/

### Routes for User Story 3

- [X] T093 [US3] Configure invoices routes (list with accountId) in frontend/src/app/features/invoices/invoices.routes.ts
- [X] T094 [US3] Export invoices feature via index.ts in frontend/src/app/features/invoices/index.ts

### Integration for User Story 3

- [X] T095 [US3] Integrate invoices routes as child routes of account detail (Invoices tab)
- [X] T096 [US3] Verify E2E tests now PASS for User Story 3

**Checkpoint**: User Story 3 complete - users can view and search invoices. P2 invoice visibility delivered.

---

## Phase 6: User Story 4 - Invoice Detail View and Navigation (Priority: P2)

**Goal**: Enable users to view detailed invoice information including line items, payments applied, and navigate between invoices and related ledger entries

**Independent Test**: Click an invoice from the list, view detail page showing account info/billing period/line items (Ride ID, date, fare)/subtotal/payments/outstanding balance/audit info, click link to navigate to related ledger entries. Delivers full invoice inspection and traceability.

### E2E Tests for User Story 4 (TDD - Write FIRST, ensure they FAIL)

- [X] T097 [P] [US4] E2E test for invoice detail view (all invoice information displayed) in frontend/e2e/invoices/invoice-detail.spec.ts
- [X] T098 [P] [US4] E2E test for cross-navigation from invoice to ledger entries in frontend/e2e/invoices/invoice-to-ledger-navigation.spec.ts
- [X] T099 [P] [US4] E2E test for cross-navigation from ledger entry to invoice in frontend/e2e/transactions/ledger-to-invoice-navigation.spec.ts

### Models for User Story 4

- [X] T100 [P] [US4] Create InvoiceLineItem model interface in frontend/src/app/features/invoices/models/invoice-line-item.model.ts
- [X] T101 [US4] Update Invoice model to include lineItems array in frontend/src/app/features/invoices/models/invoice.model.ts

### API Service for User Story 4

- [X] T102 [US4] Add getInvoice() method to InvoicesApiService in frontend/src/app/features/invoices/services/invoices-api.service.ts
- [X] T103 [US4] Unit test for getInvoice() method in frontend/src/app/features/invoices/services/invoices-api.service.spec.ts

### Components for User Story 4

- [X] T104 [US4] Create InvoiceDetailComponent with OnPush, loading/error states in frontend/src/app/features/invoices/pages/invoice-detail/
- [X] T105 [US4] Component test for InvoiceDetailComponent in frontend/src/app/features/invoices/pages/invoice-detail/invoice-detail.component.spec.ts
- [X] T106 [P] [US4] Create InvoiceLineItemsComponent (table of line items) in frontend/src/app/features/invoices/components/invoice-line-items/
- [X] T107 [P] [US4] Component test for InvoiceLineItemsComponent in frontend/src/app/features/invoices/components/invoice-line-items/invoice-line-items.component.spec.ts

### Routes for User Story 4

- [X] T108 [US4] Add invoice detail route (with invoiceId param) to invoices.routes.ts in frontend/src/app/features/invoices/invoices.routes.ts

### Integration for User Story 4

- [X] T109 [US4] Add cross-navigation link from invoice detail to ledger entries (filter ledger by linkedInvoiceId)
- [X] T110 [US4] Add cross-navigation link from ledger entry detail to invoice (if linkedInvoiceId present)
- [X] T111 [US4] Verify E2E tests now PASS for User Story 4

**Checkpoint**: User Story 4 complete - users have full invoice inspection with cross-references. P2 invoice detail delivered.

---

## Phase 7: User Story 5 - Invoice Metadata Editing (Priority: P3)

**Goal**: Enable users to edit non-financial invoice metadata (notes, internal reference, billing contact details) while protecting financial data from modification

**Independent Test**: Open invoice detail, click edit mode, modify notes/internal reference/billing contact, save changes, verify updates reflected with new timestamp. Financial amounts remain unchanged and protected. Delivers operational flexibility.

### E2E Tests for User Story 5 (TDD - Write FIRST, ensure they FAIL)

- [X] T112 [P] [US5] E2E test for invoice metadata editing workflow (edit mode, save, cancel) in frontend/e2e/invoices/metadata-editing.spec.ts
- [X] T113 [P] [US5] E2E test for metadata validation (invalid contact format, required fields) in frontend/e2e/invoices/metadata-validation.spec.ts
- [X] T114 [P] [US5] E2E test for financial data protection (amounts/line items not editable) in frontend/e2e/invoices/financial-protection.spec.ts

### API Service for User Story 5

- [X] T115 [US5] Add updateInvoiceMetadata() method to InvoicesApiService in frontend/src/app/features/invoices/services/invoices-api.service.ts
- [X] T116 [US5] Unit test for updateInvoiceMetadata() in frontend/src/app/features/invoices/services/invoices-api.service.spec.ts

### Components for User Story 5

- [X] T117 [US5] Create InvoiceMetadataEditorComponent with form controls for editable fields in frontend/src/app/features/invoices/components/invoice-metadata-editor/
- [X] T118 [US5] Component test for InvoiceMetadataEditorComponent (edit mode, validation, save/cancel) in frontend/src/app/features/invoices/components/invoice-metadata-editor/invoice-metadata-editor.component.spec.ts
- [X] T119 [US5] Add edit/save/cancel buttons to InvoiceDetailComponent
- [X] T120 [US5] Add validation logic for metadata fields (email format, max length)
- [X] T121 [US5] Add unsaved changes warning (navigate away confirmation)

### Integration for User Story 5

- [X] T122 [US5] Integrate metadata editor into invoice detail view
- [X] T123 [US5] Display financial data protection indicators (disabled inputs, tooltips)
- [X] T124 [US5] Verify E2E tests now PASS for User Story 5

**Checkpoint**: User Story 5 complete - users can edit invoice metadata safely. P3 operational flexibility delivered.

---

## Phase 8: User Story 6 - Invoice PDF Download (Priority: P3)

**Goal**: Enable users to download invoices as PDF files for sharing, archiving, or printing

**Independent Test**: View invoice detail, click download PDF button, receive PDF file with invoice number and date in filename, open PDF to verify it matches backend invoice format with all data. Delivers invoice portability.

### E2E Tests for User Story 6 (TDD - Write FIRST, ensure they FAIL)

- [X] T125 [P] [US6] E2E test for PDF download workflow (button click, file download) in frontend/e2e/invoices/pdf-download.spec.ts
- [X] T126 [P] [US6] E2E test for PDF filename format (includes invoice number and date) in frontend/e2e/invoices/pdf-filename.spec.ts
- [X] T127 [P] [US6] E2E test for concurrent PDF downloads (multiple invoices) in frontend/e2e/invoices/concurrent-pdf-downloads.spec.ts

### API Service for User Story 6

- [X] T128 [US6] Create PdfDownloadService with downloadInvoicePdf() method in frontend/src/app/features/invoices/services/pdf-download.service.ts
- [X] T129 [US6] Unit test for PdfDownloadService in frontend/src/app/features/invoices/services/pdf-download.service.spec.ts

### Components for User Story 6

- [X] T130 [P] [US6] Create PdfDownloadButtonComponent with loading state in frontend/src/app/features/invoices/components/pdf-download-button/
- [X] T131 [P] [US6] Component test for PdfDownloadButtonComponent in frontend/src/app/features/invoices/components/pdf-download-button/pdf-download-button.component.spec.ts

### Integration for User Story 6

- [X] T132 [US6] Add PDF download button to invoice detail header
- [X] T133 [US6] Implement file download with proper filename (invoice number + date)
- [X] T134 [US6] Add error handling for failed PDF generation (backend errors)
- [X] T135 [US6] Verify E2E tests now PASS for User Story 6

**Checkpoint**: User Story 6 complete - users can download invoice PDFs. P3 distribution capability delivered.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final quality validation

- [X] T136 [P] Update README.md with project overview, setup instructions, and architecture notes
- [X] T137 [P] Add JSDoc comments to all public APIs (services, components, models)
- [X] T138 Code review and refactoring (remove duplication, improve naming)
- [X] T139 Performance optimization review (bundle size, lazy loading, OnPush effectiveness)
- [X] T140 [P] Accessibility audit (WCAG AA compliance, keyboard navigation, ARIA labels)
- [X] T141 [P] Security hardening review (XSS prevention, CSRF tokens, content security policy)
- [X] T142 Browser compatibility testing (Chrome, Firefox, Safari, Edge)
- [X] T143 Run full E2E test suite across all user stories to verify integration
- [X] T144 Validate quickstart.md instructions (can a new developer set up and run the project?)
- [X] T145 [P] Update .github/agents/copilot-instructions.md with final implementation notes

**Checkpoint**: All user stories tested, documented, and production-ready

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Story 1 (Phase 3)**: Depends on Foundational phase - No dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational phase AND User Story 1 (uses account selection)
- **User Story 3 (Phase 5)**: Depends on Foundational phase AND User Story 1 (uses account selection)
- **User Story 4 (Phase 6)**: Depends on User Story 3 (extends invoice list with detail view)
- **User Story 5 (Phase 7)**: Depends on User Story 4 (adds editing to invoice detail)
- **User Story 6 (Phase 8)**: Depends on User Story 4 (adds PDF to invoice detail)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies Graph

```
Foundational (Phase 2)
    │
    ├──> User Story 1 (P1) ────┬──> User Story 2 (P1)
    │                          │
    │                          └──> User Story 3 (P2) ──> User Story 4 (P2) ──┬──> User Story 5 (P3)
    │                                                                          │
    │                                                                          └──> User Story 6 (P3)
    │
    └──> Polish (Phase 9)
```

### MVP Delivery Strategy

**Recommended MVP**: User Story 1 + User Story 2 (P1 stories only)
- Delivers core financial review capability (account selection + ledger visibility)
- Users can answer basic billing questions without invoices
- Minimal viable functionality: ~60 tasks (T001-T080, excluding polish)

**Production Critical**: Add User Story 3 + User Story 4 (P2 stories)
- Adds complete invoice visibility and detail inspection
- Enables full billing operations and customer support
- Complete production feature: ~111 tasks (includes US1-US4)

**Full Feature Set**: Add User Story 5 + User Story 6 (P3 stories)
- Adds operational flexibility (metadata editing)
- Adds distribution capability (PDF downloads)
- Complete feature: All 145 tasks

### Within Each User Story (TDD Workflow)

1. **E2E Tests FIRST**: Write all E2E tests for the story, run them, verify they FAIL
2. **Models**: Create data models and enums (parallel if independent)
3. **API Service**: Implement service layer with HTTP calls
4. **Components**: Build UI components (parallel if no dependencies)
5. **Routes**: Configure routing
6. **Integration**: Wire everything together
7. **Verify**: Run E2E tests again, they should now PASS

### Parallel Opportunities

#### Within Phase 1 (Setup)
All tasks T003-T012 can run in parallel after T001-T002 complete (project and dependencies initialized)

#### Within Phase 2 (Foundational)
- Models (T013-T015): All parallel
- Services (T016-T022): Sequential within each service, but services can be parallel
- Guards (T023-T024): Parallel
- Shared components (T025-T034): All parallel
- Shared pipes (T035-T038): All parallel

#### Within User Story 1
- E2E tests (T041-T044): All parallel (write all tests first)
- Models (T045-T047): T045 and T046 parallel, then T047
- Components (T054-T055): Parallel after API service complete

#### Within User Story 2
- E2E tests (T061-T064): All parallel
- Models (T065-T066): T065 first, then T066
- Components (T073-T075): Parallel after API service complete

#### Within User Story 3
- E2E tests (T081-T084): All parallel
- Models (T085-T087): T085 and T086 parallel, then T087

#### Within User Story 4
- E2E tests (T097-T099): All parallel
- Models (T100-T101): T100 first, then T101

#### Across User Stories (after Foundational phase)
- User Story 2, 3 can start in parallel after User Story 1 completes
- User Story 5, 6 can start in parallel after User Story 4 completes

#### Within Phase 9 (Polish)
- T136, T137, T140, T141, T145: All parallel

---

## Parallel Example: User Story 1 (MVP Foundation)

**Sequential blocks with parallel tasks within each block:**

```bash
# Block 1: E2E Tests (write FIRST, all parallel)
T041, T042, T043, T044

# Block 2: Models (enums parallel, then model)
T045 && T046 → T047

# Block 3: API Service (sequential)
T048 → T049

# Block 4: Components (some parallel after service ready)
T050 → T051 | T052 → T053 | (T054, T055)

# Block 5: Routes (sequential)
T056 → T057

# Block 6: Integration & Verification (sequential)
T058 → T059 → T060
```

**Estimated Time with Parallelization**: ~4-5 days (vs ~8-10 days sequential)

---

## Parallel Example: User Story 2 (Ledger Review)

```bash
# Block 1: E2E Tests (all parallel)
T061, T062, T063, T064

# Block 2: Models
T065 → T066

# Block 3: API Service
T067 → T068

# Block 4: Components (some parallel)
T069 → T070 | T071 → T072 | (T073, T074, T075)

# Block 5: Routes
T076 → T077

# Block 6: Integration
T078 → T079 → T080
```

**Estimated Time with Parallelization**: ~4-5 days

---

## Implementation Strategy

### MVP First (P1 Stories)
1. Complete Phase 1 (Setup) - 1-2 days
2. Complete Phase 2 (Foundational) - 3-4 days
3. **Ship User Story 1** (Account Selection) - 4-5 days - **Independent MVP Checkpoint**
4. **Ship User Story 2** (Ledger Review) - 4-5 days - **Full P1 MVP**

**Total MVP Delivery**: ~12-16 days (parallelization assumed)

### Production Critical (Add P2 Stories)
5. **Ship User Story 3** (Invoice List) - 3-4 days
6. **Ship User Story 4** (Invoice Detail) - 3-4 days

**Total Production Delivery**: ~18-24 days

### Complete Feature (Add P3 Stories)
7. **Ship User Story 5** (Metadata Editing) - 2-3 days
8. **Ship User Story 6** (PDF Download) - 2-3 days
9. Complete Phase 9 (Polish) - 2-3 days

**Total Complete Delivery**: ~24-33 days

### Independent Testing Per Story

Each user story phase ends with a verification checkpoint where E2E tests PASS. This enables:
- **Incremental Delivery**: Ship US1 to production, then US2, then US3, etc.
- **Independent Testing**: QA can test each story in isolation
- **Parallel Development**: Team members can work on US2 and US3 simultaneously after US1 completes

---

## Task Count Summary

- **Phase 1 (Setup)**: 12 tasks (T001-T012)
- **Phase 2 (Foundational)**: 28 tasks (T013-T040)
- **Phase 3 (US1 - Account Selection)**: 20 tasks (T041-T060) 🎯 MVP
- **Phase 4 (US2 - Ledger Review)**: 20 tasks (T061-T080) 🎯 MVP
- **Phase 5 (US3 - Invoice List)**: 16 tasks (T081-T096)
- **Phase 6 (US4 - Invoice Detail)**: 15 tasks (T097-T111)
- **Phase 7 (US5 - Metadata Editing)**: 13 tasks (T112-T124)
- **Phase 8 (US6 - PDF Download)**: 11 tasks (T125-T135)
- **Phase 9 (Polish)**: 10 tasks (T136-T145)

**Total Tasks**: 145

**MVP Tasks (P1 only)**: 80 tasks (Phases 1-4)  
**Production Tasks (P1+P2)**: 111 tasks (Phases 1-6)  
**Complete Feature**: 145 tasks (All phases)

---

## Validation Checklist

### Format Validation ✅
- All tasks follow checklist format: `- [ ] [TaskID] [P?] [Story?] Description with file path`
- Task IDs sequential: T001-T145
- [P] markers on parallelizable tasks only
- [Story] labels present for all user story phase tasks (US1-US6)
- No [Story] labels for Setup, Foundational, or Polish phases

### Content Validation ✅
- E2E tests included for all 6 user stories (TDD workflow)
- Unit tests included for services, components, pipes
- All entities from data-model.md mapped to tasks (Tenant, Account, LedgerEntry, Invoice, InvoiceLineItem)
- All API endpoints from contracts/ mapped to service methods
- File paths are complete and follow project structure from plan.md

### Dependency Validation ✅
- Foundational phase blocks all user stories
- User story dependencies respect priority order
- Cross-navigation tasks appear in correct stories
- Independent test criteria documented per story

### Constitution Compliance ✅
- TDD mandated: E2E tests written FIRST in each story phase
- OnPush change detection: Required in all list/detail components
- Lazy loading: Routes configured with lazy loading
- Error states: Loading/error/empty states in all data-fetching components
- Performance: trackBy functions in lists, pagination
- Domain-driven: Features organized by domain (accounts, transactions, invoices)
