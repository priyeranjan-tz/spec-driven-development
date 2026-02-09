<!--
SYNC IMPACT REPORT - Constitution Update
================================================================================
Version Change: TEMPLATE → 1.0.0 (Initial Ratification)
Date: 2026-02-06

Modified Sections:
- NEW: All core principles defined (Production-Grade First, Domain-Driven Architecture, Resilience & Error Handling, Performance & Observability, Test-First Development)
- NEW: Security & Type Safety Requirements section
- NEW: Technology Stack & Standards section
- NEW: Governance rules established

Templates Requiring Updates:
- ✅ plan-template.md - Constitution Check section aligns with 5 core principles
- ✅ spec-template.md - Requirements structure supports constitution compliance
- ✅ tasks-template.md - Task categorization reflects principle-driven development
- ✅ checklist-template.md - No updates required (generic structure)
- ✅ agent-file-template.md - No updates required (auto-generated)

Follow-up TODOs:
- None - All placeholders resolved based on existing core principles documentation

Source References:
- prerequiste/core-principles-angular.md
- prerequiste/core-principles-dotnet.md
- prerequiste/core-principles-react.md
- prerequiste/20260205.requirements.backend.md
- prerequiste/20260205.requirements.frontend.md
================================================================================
-->

# Accounting & Invoicing System Constitution

## Core Principles

### I. Production-Grade Code First (NON-NEGOTIABLE)

**ALL code written MUST be production-ready from the first implementation.**

There is no "development mode" or "prototype phase." Every line of code must be:
- **Deployment-ready**: No placeholders, TODOs, or "will fix later" implementations
- **Observable**: Structured logging with correlation IDs, telemetry for failures
- **Resilient**: Retry policies, circuit breakers, timeout handling configured
- **Performant**: Parallel processing for bulk operations, optimized queries
- **Secure**: Input validation, sanitization, proper token handling
- **Maintainable**: Clear boundaries, explicit dependencies, documented contracts

**Rationale**: We build distributed financial systems where correctness, reliability, and auditability are non-negotiable. Iterative improvements are for adding NEW features, not fixing fundamental architectural or performance issues that should have been addressed initially. Zero tolerance for "this works for now" implementations that require rework later.

### II. Domain-Driven Architecture

**Organize code by feature/domain, not by technical type.**

#### Backend (.NET Microservices)
- **Domain Layer**: Aggregates, entities, value objects, domain events, repository abstractions
  - ZERO infrastructure dependencies (no EF Core, ASP.NET, HTTP, messaging)
  - Private setters only; encapsulate state
  - Single source of truth for ALL business rules
- **Application Layer**: Commands, queries, handlers, validators, DTOs
  - NO MediatR—use explicit handler classes
  - Validation via FluentValidation
- **Infrastructure Layer**: DbContext, repositories, messaging, outbox pattern
  - Domain entities SEPARATE from persistence entities (mandatory)
  - Mappers translate between models
- **API Layer**: Controllers, middleware, request/response models
  - Global exception handling first in pipeline
  - RFC 9457 Problem Details format

#### Frontend (React/Angular)
- **Feature-based structure**: Each feature owns UI, hooks/services, API calls, state, tests
- **Single public entry point**: index.ts per feature
- **Shared code**: Only in design-system/, shared/hooks/, shared/utils/
  - Must be generic, stable, reused by ≥2 features
- **Standalone components**: Preferred in Angular apps
- **Lazy loading**: All feature routes must be lazy-loaded

**Rationale**: Feature boundaries enforce decoupling, enable independent testing, and make codebases navigable at scale. Domain-driven design ensures business rules remain authoritative and infrastructure concerns stay isolated.

### III. Resilience & Error Handling (NON-NEGOTIABLE)

**Every external interaction MUST have resilience patterns configured.**

#### Result Pattern (Backend)
- **Use Result for**: Business rule violations, validation errors, resource not found, conflict states, expected failures
- **Use Exception for**: Database connection failures, network timeouts, unexpected infrastructure failures
- **Error Type → HTTP Mapping**:
  - Validation → 400 Bad Request
  - NotFound → 404 Not Found
  - Conflict → 409 Conflict
  - Unauthorized → 401 Unauthorized

#### Resilience Patterns (Backend)
- Retry with exponential backoff (Polly)
- Circuit breaker for failing services
- Timeout policies (no operation without timeout)
- Bulkhead isolation for resource pools
- Fallback strategies for graceful degradation

#### Error Handling (Frontend)
- Global error boundaries for unhandled exceptions
- Loading/empty/error states for ALL data fetching
- User-friendly error messages with recovery options
- Error classification: network, validation, authorization, unexpected
- Request cancellation and cleanup on unmount

**Rationale**: Distributed financial systems must handle partial failures gracefully. The Result pattern makes expected failures explicit in the type system, while resilience patterns ensure transient failures don't cascade into outages.

### IV. Performance & Observability

**Performance optimization and observability are mandatory from day one.**

#### Performance Requirements (Backend)
- **Parallel processing**: Use Task.WhenAll for bulk operations (never sequential foreach)
- **Query optimization**: AsNoTracking(), projections, indexed columns, no N+1 queries
- **Concurrency**: Thread-safe operations, controlled concurrency limits
- **Resource management**: Proper disposal (using, IDisposable), ConfigureAwait(false)

#### Performance Requirements (Frontend)
- **Change detection**: OnPush strategy where state is immutable (Angular)
- **Lazy loading**: Routes and modules split by feature
- **Performance budgets**: Defined in build configuration
- **Image optimization**: NgOptimizedImage (Angular), optimized assets (React)
- **Memoization**: React.memo, useMemo, useCallback for expensive computations
- **List rendering**: trackBy (Angular), keys (React) for large lists

#### Observability (All Layers)
- **Structured logging**: Serilog (backend), console.error with context (frontend)
- **Correlation IDs**: Propagated across service boundaries
- **Metrics**: Prometheus-compatible (response times, error rates, throughput)
- **Tracing**: OpenTelemetry/Jaeger for distributed traces
- **No sensitive data**: Never log credentials, PII, or financial secrets

**Rationale**: Performance issues discovered late require expensive rewrites. Observability enables rapid diagnosis in production. Both must be architected in from the start, not retrofitted.

### V. Test-First Development (NON-NEGOTIABLE)

**Tests are written FIRST, approved by stakeholders, and MUST FAIL before implementation.**

#### Testing Discipline
1. Write acceptance tests based on user stories
2. Stakeholder reviews and approves test scenarios
3. Implement tests—verify they FAIL (red)
4. Implement feature—tests PASS (green)
5. Refactor with test coverage protection

#### Required Test Coverage
- **Unit tests**: Services, components, pipes, utilities, domain logic
- **Component tests**: UI states (loading, error, empty, success)
- **Contract tests**: API endpoint contracts, response schemas
- **Integration tests**: Cross-service communication, database interactions
- **E2E tests**: Critical user paths (authentication, transaction creation, invoice generation)

#### Test Quality Requirements
- Stable selectors (data-testid), avoid brittle DOM queries
- Isolated tests (no shared mutable state)
- Fast feedback (<10s for unit/component, <2min for integration)
- Clear failure messages with actionable diagnostics
- Tests as documentation (describe business behavior)

**Rationale**: TDD ensures requirements are understood before code is written, prevents regression, and serves as living documentation. In financial systems, test-first development is a compliance and correctness imperative, not a productivity trade-off.

## Security & Type Safety Requirements

### Type Safety (NON-NEGOTIABLE)
- **TypeScript strict mode**: true (frontend)
- **.NET nullable reference types**: enabled (backend)
- **No any/dynamic**: Use specific types with runtime validation at boundaries
- **API contract validation**: Schema validation (Zod/Yup frontend, FluentValidation backend)
- **Encapsulation**: Private setters, immutable where possible

### Security Standards
- **Input validation**: All user inputs validated and sanitized at entry points
- **Output encoding**: Avoid innerHTML unless sanitized via DomSanitizer (frontend)
- **Authentication**: Secure token handling (HttpOnly cookies, no secrets in frontend)
- **Authorization**: Role-based access control, principle of least privilege
- **HTTPS only**: All API communication encrypted in transit
- **Dependency updates**: Security patches applied within 7 days
- **Secrets management**: No hardcoded credentials, use environment variables/vaults
- **SQL injection prevention**: Parameterized queries only, no string concatenation

### Accessibility (Frontend)
- **Keyboard navigation**: All interactive elements accessible via keyboard
- **ARIA attributes**: Proper roles, labels, and live regions for custom components
- **Semantic HTML**: Use native elements (button, nav, main) over generic divs
- **Color contrast**: WCAG AA minimum (4.5:1 for normal text)
- **Screen reader testing**: Validate with NVDA/JAWS or browser extensions
- **Automated validation**: Lighthouse, aXe in CI pipeline

## Technology Stack & Standards

### Backend
- **.NET 8+**: ASP.NET Core, EF Core with PostgreSQL
- **Architecture**: Domain-Driven Design, Microservices, Event-Driven (Saga pattern)
- **Messaging**: At-least-once delivery via Outbox pattern
- **Validation**: FluentValidation for commands/queries
- **Error handling**: Result pattern with typed errors
- **Resilience**: Polly (retry, circuit breaker, timeout, bulkhead)
- **Testing**: xUnit, integration tests with TestContainers

### Frontend
- **React 18+** or **Angular 17+**: Standalone components (Angular), functional components (React)
- **TypeScript**: strict: true, no any/unknown without narrowing
- **State management**: Server state separate from UI state (TanStack Query/RxJS)
- **Forms**: Reactive Forms (Angular), React Hook Form (React)
- **Styling**: CSS Modules or styled-components (isolated, component-scoped)
- **Testing**: Jest + React Testing Library OR Jasmine + Karma, Playwright E2E

### Database
- **PostgreSQL 15+**: Double-entry ledger pattern
- **Migrations**: Code-first with EF Core or Flyway
- **Transactions**: ACID guarantees, no distributed transactions (use Saga)
- **Indexing**: Define indexes on query-heavy columns upfront

### Observability
- **Logging**: Serilog (structured), log levels (Info/Warn/Error/Fatal)
- **Metrics**: Prometheus + Grafana
- **Tracing**: OpenTelemetry or Jaeger
- **Correlation IDs**: Propagated in headers (X-Correlation-ID)

## Governance

### Authority & Compliance
- This constitution supersedes all other coding practices, guidelines, or conventions
- All pull requests MUST pass constitution compliance checks before merge
- Violations require explicit justification documented in plan.md Complexity Tracking section
- Unjustified violations are grounds for PR rejection

### Amendment Procedure
1. Proposed change documented with rationale in GitHub issue or RFC
2. Team review and approval (majority consensus or tech lead decision)
3. Version bump according to semantic versioning:
   - **MAJOR**: Backward-incompatible governance changes, principle removal/redefinition
   - **MINOR**: New principle added, materially expanded guidance
   - **PATCH**: Clarifications, wording improvements, typo fixes
4. Update constitution.md with Sync Impact Report (HTML comment)
5. Propagate changes to affected templates (plan, spec, tasks)
6. Announce in team channels with migration guidance if needed

### Continuous Validation
- Constitution checks run in Phase 0 (research) and re-run in Phase 1 (design) of /speckit.plan
- Automated linting enforces subset of rules (TypeScript strict, test coverage thresholds)
- Manual review gates for architecture decisions (Result vs Exception, state management choices)
- Post-implementation retrospectives identify constitution gaps or ambiguities

### Living Document
- Templates (plan-template.md, spec-template.md, tasks-template.md) MUST align with principles
- Agent guidance files auto-generated from feature plans reflect current standards
- Constitution updates trigger template review and synchronization
- Quarterly reviews assess if principles remain fit for purpose as system scales

**Version**: 1.0.0 | **Ratified**: 2026-02-06 | **Last Amended**: 2026-02-06
