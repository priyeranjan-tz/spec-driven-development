# Implementation Plan: Accounting & Invoicing UI

**Branch**: `001-accounting-invoicing-ui` | **Date**: 2026-02-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-accounting-invoicing-ui/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a tenant-scoped Angular web application that provides finance and operations users with transparent visibility into financial transactions and invoices. The UI enables account selection, ledger entry review with filtering, invoice listing and detail views, metadata editing, and PDF downloads. This is a read-heavy operational interface that consumes the backend Dual-Entry Accounting Service API without performing any accounting logic itself. Technical approach uses Angular 17+ with standalone components, Tailwind CSS for styling, feature-based architecture (accounts, transactions, invoices), lazy-loaded routes, OnPush change detection, RxJS for state management, and Playwright for E2E testing.

## Technical Context

**Language/Version**: TypeScript 5.x with Angular 17+ (latest stable)  
**Primary Dependencies**: @angular/core, @angular/router, RxJS, Tailwind CSS, @angular/cli, Playwright, Jasmine/Karma  
**Storage**: N/A (frontend only, consumes backend REST API)  
**Testing**: Jasmine + Karma for unit/component tests, Playwright for E2E tests  
**Target Platform**: Desktop-first responsive web UI (modern browsers: Chrome, Firefox, Safari, Edge)  
**Project Type**: Web application (frontend only, no backend in this feature)  
**Performance Goals**: Ledger load <2s (90 days, 1000 transactions), invoice list load <1s (500 invoices), full navigation flow <10s from login to ledger view, PDF download <5s (100 line items)  
**Constraints**: Desktop-first UI (responsive but not mobile-optimized), strong consistency with backend state required, strict tenant isolation enforced, read-only ledger access mandatory, USD-only currency formatting  
**Scale/Scope**: Finance and operations users within tenants, 6 prioritized user stories (P1: account selection + ledger review, P2: invoice list + detail, P3: metadata editing + PDF download), 22 functional requirements, 4 key entities (Account, Ledger Entry, Invoice, Tenant)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Principle I: Production-Grade Code First ✅ PASS

**Requirement**: ALL code must be production-ready from first implementation (no placeholders, TODOs, or "will fix later").

**Compliance**:
- ✅ **OnPush change detection**: Required for all components to optimize performance
- ✅ **Lazy loading**: All feature routes (accounts, transactions, invoices) must be lazy-loaded
- ✅ **Error boundaries**: Global error handler + local error states for all data fetching operations
- ✅ **Observable patterns**: Structured console logging for client-side errors with context
- ✅ **Performance budgets**: Defined in angular.json per Angular CLI standards
- ✅ **No placeholders**: All loading, empty, and error states must be implemented initially

**No violations**. This principle is fully addressable with Angular best practices.

### Principle II: Domain-Driven Architecture ✅ PASS

**Requirement**: Organize code by feature/domain, not by technical type. Feature-based structure with clear boundaries.

**Compliance**:
- ✅ **Feature-based structure**: 
  - `features/accounts/` - Account list and detail views
  - `features/transactions/` - Ledger entry list, filters, detail views
  - `features/invoices/` - Invoice list, detail, metadata editing, PDF download
- ✅ **Core services**: Singleton services in `core/` (HTTP interceptors, auth guards, error handling)
- ✅ **Shared UI**: Reusable components in `shared/` (buttons, tables, filters, pagination)
- ✅ **Standalone components**: Preferred pattern for Angular 17+
- ✅ **Single entry point**: Each feature exports via index.ts
- ✅ **No circular dependencies**: Features do not import each other directly

**No violations**. Angular feature module pattern aligns with constitution requirements.

### Principle III: Resilience & Error Handling ✅ PASS

**Requirement**: Global error boundaries, loading/error/empty states for ALL data fetching, request cancellation.

**Compliance**:
- ✅ **Global error boundary**: Angular ErrorHandler implementation for unhandled exceptions
- ✅ **Loading states**: Spinner/skeleton UI for all async operations (account list, ledger, invoices)
- ✅ **Empty states**: Clear messaging when accounts have zero transactions or invoices
- ✅ **Error states**: User-friendly error messages with retry options for failed API calls
- ✅ **Request cancellation**: RxJS takeUntilDestroyed() for subscription cleanup on component unmount
- ✅ **Error classification**: Network errors (offline), validation errors (400), authorization errors (401/403), server errors (500)

**No violations**. Angular + RxJS patterns provide all required resilience mechanisms.

### Principle IV: Performance & Observability ✅ PASS

**Requirement**: Performance optimization and observability mandatory from day one. OnPush change detection, lazy loading, trackBy for lists.

**Compliance**:
- ✅ **OnPush strategy**: Default for all components (especially list views: accounts, transactions, invoices)
- ✅ **Lazy loading**: Feature routes loaded on-demand (reduces initial bundle size)
- ✅ **trackBy functions**: Required for *ngFor in account list, ledger entries, invoice lists (prevents unnecessary DOM re-renders)
- ✅ **Async pipe**: Preferred over manual subscriptions (automatic subscription management)
- ✅ **Performance budgets**: Defined in angular.json (initial bundle, lazy chunks)
- ✅ **Structured logging**: console.error with context (user action, API endpoint, error type) - no sensitive data
- ✅ **Correlation IDs**: Propagate X-Correlation-ID header in HTTP interceptor for tracing

**No violations**. Angular performance best practices meet all requirements.

### Principle V: Test-First Development ✅ PASS

**Requirement**: Tests written FIRST, must FAIL before implementation. Unit tests, component tests, E2E tests required.

**Compliance**:
- ✅ **Unit tests**: Jasmine + Karma for services (API adapters, state management, utilities)
- ✅ **Component tests**: Test all component states (loading, error, empty, success) with TestBed
- ✅ **E2E tests**: Playwright for critical user paths:
  - Account selection → ledger review (P1)
  - Invoice list → detail view (P2)
  - Metadata editing + save (P3)
  - PDF download workflow (P3)
- ✅ **Test coverage**: Target 70%+ lines, 60%+ branches for core business logic
- ✅ **Stable selectors**: Use data-testid attributes, avoid brittle DOM queries
- ✅ **TDD workflow**: Write acceptance tests from user stories → verify FAIL → implement → verify PASS

**No violations**. Angular Testing tools + Playwright support full TDD workflow.

## Constitution Check Summary

**Result**: ✅ ALL PRINCIPLES PASS

**Rationale**: This is a frontend-only application using Angular 17+ with industry-standard patterns. All constitution principles are directly supported by Angular framework features and recommended practices:

- Production-grade code: Angular CLI enforces quality standards, OnPush + lazy loading built-in
- Domain-driven architecture: Feature modules align with DDD boundaries
- Resilience: RxJS + ErrorHandler provide comprehensive error handling
- Performance: Angular change detection + AOT compilation optimize performance
- Test-first: Angular Testing + Playwright enable full TDD

**No complexity tracking required** - no violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/001-accounting-invoicing-ui/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   ├── accounts-api.yaml
│   ├── transactions-api.yaml
│   └── invoices-api.yaml
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
frontend/
├── src/
│   ├── app/
│   │   ├── core/                      # Singleton services, global providers
│   │   │   ├── services/
│   │   │   │   ├── http-interceptor.service.ts
│   │   │   │   ├── error-handler.service.ts
│   │   │   │   └── tenant.service.ts
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── tenant.guard.ts
│   │   │   └── models/
│   │   │       ├── api-response.ts
│   │   │       └── error.model.ts
│   │   ├── shared/                    # Reusable UI components, pipes, directives
│   │   │   ├── components/
│   │   │   │   ├── button/
│   │   │   │   ├── table/
│   │   │   │   ├── pagination/
│   │   │   │   ├── empty-state/
│   │   │   │   ├── error-state/
│   │   │   │   ├── loading-spinner/
│   │   │   │   └── filter-bar/
│   │   │   ├── pipes/
│   │   │   │   ├── currency-format.pipe.ts
│   │   │   │   └── date-format.pipe.ts
│   │   │   └── directives/
│   │   ├── features/                  # Feature modules (domain-driven)
│   │   │   ├── accounts/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── account-list/
│   │   │   │   │   │   ├── account-list.component.ts
│   │   │   │   │   │   ├── account-list.component.html
│   │   │   │   │   │   ├── account-list.component.css
│   │   │   │   │   │   └── account-list.component.spec.ts
│   │   │   │   │   └── account-detail/
│   │   │   │   │       ├── account-detail.component.ts
│   │   │   │   │       ├── account-detail.component.html
│   │   │   │   │       ├── account-detail.component.css
│   │   │   │   │       └── account-detail.component.spec.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── account-card/
│   │   │   │   │   └── account-summary/
│   │   │   │   ├── services/
│   │   │   │   │   ├── accounts-api.service.ts
│   │   │   │   │   └── accounts-api.service.spec.ts
│   │   │   │   ├── models/
│   │   │   │   │   ├── account.model.ts
│   │   │   │   │   └── account-type.enum.ts
│   │   │   │   ├── accounts.routes.ts
│   │   │   │   └── index.ts
│   │   │   ├── transactions/
│   │   │   │   ├── pages/
│   │   │   │   │   ├── transaction-list/
│   │   │   │   │   └── transaction-detail/
│   │   │   │   ├── components/
│   │   │   │   │   ├── transaction-row/
│   │   │   │   │   ├── transaction-filters/
│   │   │   │   │   └── running-balance-display/
│   │   │   │   ├── services/
│   │   │   │   │   ├── transactions-api.service.ts
│   │   │   │   │   └── transactions-api.service.spec.ts
│   │   │   │   ├── models/
│   │   │   │   │   ├── ledger-entry.model.ts
│   │   │   │   │   └── source-type.enum.ts
│   │   │   │   ├── transactions.routes.ts
│   │   │   │   └── index.ts
│   │   │   └── invoices/
│   │   │       ├── pages/
│   │   │       │   ├── invoice-list/
│   │   │       │   └── invoice-detail/
│   │   │       ├── components/
│   │   │       │   ├── invoice-card/
│   │   │       │   ├── invoice-line-items/
│   │   │       │   ├── invoice-metadata-editor/
│   │   │       │   └── pdf-download-button/
│   │   │       ├── services/
│   │   │       │   ├── invoices-api.service.ts
│   │   │       │   ├── invoices-api.service.spec.ts
│   │   │       │   └── pdf-download.service.ts
│   │   │       ├── models/
│   │   │       │   ├── invoice.model.ts
│   │   │       │   ├── invoice-line-item.model.ts
│   │   │       │   └── invoice-frequency.enum.ts
│   │   │       ├── invoices.routes.ts
│   │   │       └── index.ts
│   │   ├── app.routes.ts              # Main route configuration
│   │   └── app.config.ts              # App-wide providers configuration
│   ├── styles.css                     # Tailwind entry + global styles
│   ├── main.ts
│   └── index.html
├── e2e/                               # Playwright E2E tests
│   ├── accounts/
│   │   ├── account-selection.spec.ts
│   │   └── account-navigation.spec.ts
│   ├── transactions/
│   │   ├── ledger-review.spec.ts
│   │   └── transaction-filters.spec.ts
│   ├── invoices/
│   │   ├── invoice-list.spec.ts
│   │   ├── invoice-detail.spec.ts
│   │   ├── metadata-editing.spec.ts
│   │   └── pdf-download.spec.ts
│   └── playwright.config.ts
├── .editorconfig
├── .eslintrc.cjs
├── .prettierrc
├── tailwind.config.ts
├── angular.json
├── tsconfig.json
├── package.json
└── README.md
```

**Structure Decision**: Frontend-only Angular application (no backend in this feature). Uses Angular 17+ feature-based structure per constitution Domain-Driven Architecture principle. Each feature (accounts, transactions, invoices) is self-contained with pages, components, services, models, and routes. Core services provide cross-cutting concerns (HTTP interceptors, error handling, tenant context). Shared components are reusable UI building blocks (buttons, tables, pagination, empty/error states). E2E tests organized by feature matching user stories.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

**No violations to track.** All constitution principles pass without exceptions.

---

## Post-Phase 1 Constitution Re-Evaluation

*As required by constitution: Re-check after Phase 1 design (data model, contracts, quickstart completed).*

### Design Artifact Review

**Artifacts Generated**:
1. ✅ **data-model.md**: TypeScript interfaces for Account, LedgerEntry, Invoice, Tenant with strict typing and validation rules
2. ✅ **contracts/accounts-api.yaml**: OpenAPI spec for account endpoints (list, detail)
3. ✅ **contracts/transactions-api.yaml**: OpenAPI spec for ledger entry endpoints (list, detail, filters)
4. ✅ **contracts/invoices-api.yaml**: OpenAPI spec for invoice endpoints (list, detail, metadata update, PDF download)
5. ✅ **quickstart.md**: Setup instructions including dependencies, environment config, dev workflow, testing, troubleshooting

### Principle Verification Post-Design

#### I. Production-Grade Code First ✅ CONFIRMED

- **Data Model**: All TypeScript interfaces use strict types (no `any`), validation rules documented, immutability enforced
- **API Contracts**: Comprehensive OpenAPI specs with error responses, security schemes, request/response validation
- **Quickstart**: Performance budgets defined, linting/formatting configured, production build steps documented

**Status**: No violations. Design artifacts support production-grade implementation.

#### II. Domain-Driven Architecture ✅ CONFIRMED

- **Data Model**: Entities map to business domains (Account, Ledger, Invoice) not technical structures
- **API Contracts**: Organized by feature (accounts, transactions, invoices) matching frontend structure
- **Project Structure**: Feature-based layout explicitly documented in plan

**Status**: No violations. Design maintains domain boundaries.

#### III. Resilience & Error Handling ✅ CONFIRMED

- **Data Model**: Nullable fields explicitly marked, error types documented (ApiError schema)
- **API Contracts**: All endpoints specify 401/403/404/500 error responses with ApiError schema
- **Research**: Error handling patterns documented (global handler, local states, retry, cancellation)

**Status**: No violations. Comprehensive error handling designed in.

#### IV. Performance & Observability ✅ CONFIRMED

- **Data Model**: Currency in cents (integer arithmetic), date formatting utilities included
- **API Contracts**: Pagination parameters on all list endpoints (50 items default, 100 max)
- **Quickstart**: Performance targets specified (<2s ledger, <1s invoice), bundle size budgets defined

**Status**: No violations. Performance requirements baked into design.

#### V. Test-First Development ✅ CONFIRMED

- **Quickstart**: Unit test, component test, and E2E test commands documented with TDD workflow
- **E2E Structure**: Test files organized by feature and user story (accounts/, transactions/, invoices/)
- **Research**: Test strategy documented with TDD workflow (write → fail → implement → pass)

**Status**: No violations. Test infrastructure ready for TDD.

### Security & Type Safety Re-Check ✅ CONFIRMED

- **Type Safety**: All data models use TypeScript strict mode, no `any` types
- **Input Validation**: API contracts specify format, minLength, maxLength, enums for all fields
- **Tenant Isolation**: TenantId required in all API paths, X-Tenant-ID header propagation documented
- **Sensitive Data**: No credentials in frontend, auth token via secure mechanism (noted in quickstart)

### Re-Evaluation Summary

**Result**: ✅ ALL PRINCIPLES CONTINUE TO PASS POST-DESIGN

**Changes Since Initial Check**: None. Design artifacts reinforce constitution compliance:
- Data model enforces type safety and immutability
- API contracts standardize error handling and pagination
- Quickstart enables production-grade setup from day one

**Ready to Proceed**: ✅ Yes. All design artifacts complete and compliant. Ready for Phase 2 (task generation via /speckit.tasks command).

---

## Phase Completion Status

- ✅ **Phase 0 (Research)**: All technical unknowns resolved, decisions documented in research.md
- ✅ **Phase 1 (Design & Contracts)**: Data model, API contracts, quickstart complete and constitution-compliant
- ⏸️ **Phase 2 (Tasks)**: Awaiting `/speckit.tasks` command to generate implementation task list

**Next Command**: `/speckit.tasks` (generates tasks.md with TDD-organized implementation tasks)
