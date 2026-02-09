# Research: Accounting & Invoicing UI

**Feature**: Accounting & Invoicing UI  
**Branch**: 001-accounting-invoicing-ui  
**Date**: 2026-02-06  
**Phase**: 0 (Outline & Research)

## Overview

This document consolidates technical research and decisions for building a production-grade Angular frontend application that consumes the Dual-Entry Accounting Service API. All decisions align with the project constitution and tech specification standards (prerequiste/tech-specification-angular.md).

## Research Questions Resolved

### 1. Angular Version & Setup

**Question**: Which Angular version and setup approach should we use?

**Decision**: Angular 17+ with standalone components

**Rationale**:
- Standalone components are the modern Angular pattern (recommended in constitution and tech-specification-angular.md)
- Reduces boilerplate compared to NgModules
- Better tree-shaking and lazy loading support
- Aligns with Angular team's recommended direction
- Simpler dependency injection with route-level providers

**Alternatives Considered**:
- NgModule-based architecture: Rejected due to increased boilerplate and constitution preference for simplicity
- Angular 16: Rejected in favor of latest stable (17+) for best practices and long-term support

**Implementation Notes**:
- Use Angular CLI for project generation and component scaffolding
- Configure angular.json with performance budgets (initial bundle <500KB, lazy chunks <250KB)
- Enable strict TypeScript mode in tsconfig.json
- Use .editorconfig, .prettierrc, .eslintrc.cjs for consistent code style

---

### 2. State Management Strategy

**Question**: How should we manage application state (accounts, transactions, invoices)?

**Decision**: RxJS-based service facades (no NgRx/ComponentStore)

**Rationale**:
- Application is read-heavy with straightforward CRUD operations
- No complex shared state requirements between unrelated features
- RxJS Observables + async pipe provide sufficient reactivity
- Service facades centralize API calls and state caching
- Simpler than NgRx for this use case (YAGNI principle per constitution)
- Direct mapping to backend API responses

**Pattern**:
```typescript
@Injectable({ providedIn: 'root' })
export class AccountsApiService {
  private http = inject(HttpClient);
  
  getAccounts(tenantId: string): Observable<Account[]> {
    return this.http.get<Account[]>(`/api/tenants/${tenantId}/accounts`).pipe(
      retry({ count: 3, delay: 1000 }),
      catchError(this.handleError)
    );
  }
}
```

**Alternatives Considered**:
- NgRx: Rejected as over-engineering for read-heavy UI without complex state interactions
- Signals (Angular 17+): Considered for future iteration but RxJS meets current needs and has more mature patterns
- ComponentStore: Rejected as unnecessary for simple API-driven UI

---

### 3. Styling Approach

**Question**: How should we implement UI styling while maintaining consistency?

**Decision**: Tailwind CSS with utility-first approach

**Rationale**:
- Specified in tech-specification-angular.md as required
- Rapid development with utility classes
- Small bundle size (unused styles purged)
- Consistent design system without custom CSS
- Good integration with Angular (no CSS-in-JS conflicts)
- Desktop-first responsive design supported

**Configuration**:
- Install: `tailwindcss`, `postcss`, `autoprefixer`
- Configure tailwind.config.ts with custom theme (brand colors, spacing scale)
- Import in styles.css: `@tailwind base; @tailwind components; @tailwind utilities;`
- Use `[ngClass]` for conditional styling (avoid `clsx`/`tailwind-merge` per tech spec)

**Alternatives Considered**:
- Ang

ular Material: Rejected to avoid heavy dependency and to follow tech spec requirement
- CSS Modules: Not needed with Tailwind utility-first approach
- Styled-components: Not idiomatic for Angular (better for React)

---

### 4. HTTP Communication & API Integration

**Question**: How should we structure API communication with the backend?

**Decision**: Angular HttpClient with interceptors for cross-cutting concerns

**Pattern**:
```typescript
// HTTP Interceptor for tenant context
@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const tenantId = this.tenantService.getCurrentTenantId();
    const cloned = req.clone({
      headers: req.headers
        .set('X-Tenant-ID', tenantId)
        .set('X-Correlation-ID', this.correlationId())
    });
    return next.handle(cloned);
  }
}
```

**Rationale**:
- HttpClient is Angular built-in (no extra dependencies)
- Interceptors centralize tenant isolation, correlation IDs, error handling, auth tokens
- Observable-based API integrates naturally with RxJS state management
- Retry policies via RxJS operators (retry, retryWhen)
- Type-safe request/response models

**Key Interceptors**:
1. **TenantInterceptor**: Inject X-Tenant-ID header for tenant isolation
2. **CorrelationIdInterceptor**: Generate and propagate X-Correlation-ID for tracing
3. **ErrorInterceptor**: Centralized error handling (network, 401, 403, 500)
4. **LoadingInterceptor**: Track in-flight requests for global loading indicator

**Alternatives Considered**:
- Axios: Rejected in favor of Angular built-in HttpClient
- Fetch API: Rejected as lower-level and lacks Angular integration

---

### 5. Error Handling Strategy

**Question**: How should we handle errors gracefully across the application?

**Decision**: Multi-layered error handling (global + local + user feedback)

**Architecture**:

1. **Global Error Handler** (core/services/error-handler.service.ts):
```typescript
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  handleError(error: Error | HttpErrorResponse): void {
    if (error instanceof HttpErrorResponse) {
      // API error
      this.logApiError(error);
    } else {
      // Client-side error
      this.logClientError(error);
    }
  }
}
```

2. **Local Error States** (component-level):
- Loading: Show spinner/skeleton UI
- Empty: Display empty state message with CTA
- Error: Show error message with retry button
- Success: Display data

3. **User-Friendly Messages**:
- Network error (offline): "Unable to connect. Please check your internet connection."
- 401/403: "Session expired. Please log in again."
- 404: "The requested resource was not found."
- 500: "An unexpected error occurred. Please try again later."

**Rationale**:
- Constitution requires error boundaries for all external interactions
- Multi-layer approach provides both observability and user experience
- Prevents silent failures
- Enables recovery actions (retry, refresh, navigate)

**Alternatives Considered**:
- Error state library: Rejected as unnecessary (RxJS + local state sufficient)

---

### 6. Performance Optimization Patterns

**Question**: How do we ensure the UI meets performance requirements (<2s ledger load, <1s invoice list)?

**Decision**: Multi-faceted performance strategy

**Techniques**:

1. **Change Detection Optimization**:
   - OnPush strategy for all components (especially list views)
   - Immutable data patterns (return new objects, not mutate)
   - trackBy functions for *ngFor (account list, ledger list, invoice list)

2. **Lazy Loading**:
   - Feature routes loaded on-demand
   - Lazy load heavy dependencies (PDF viewer library)

3. **Pagination**:
   - Server-side pagination for ledger (default 50 items/page)
   - Infinite scroll or traditional pagination for invoice list
   - Virtual scrolling for very large lists (if needed)

4. **API Response Optimization**:
   - Request only needed fields (e.g., list view vs detail view)
   - Cache responses in service layer (with TTL/invalidation)
   - Debounce filter inputs (300ms delay before API call)

5. **Bundle Optimization**:
   - Performance budgets in angular.json
   - Code splitting by feature route
   - Tree-shaking unused code

**Rationale**:
- Constitution requires performance optimization from day one
- Combining multiple techniques ensures we meet <2s and <1s load targets
- OnPush + trackBy prevent unnecessary re-renders (major Angular performance win)

**Alternatives Considered**:
- Client-side filtering only: Rejected due to large dataset requirements (1000+ transactions)
- Web Workers for heavy computation: Deferred as premature optimization (no heavy client-side computation)

---

### 7. Testing Strategy

**Question**: What testing approach will ensure quality and enable TDD workflow?

**Decision**: Three-tier testing (Unit + Component + E2E)

**Testing Breakdown**:

**1. Unit Tests (Jasmine + Karma)**:
- Test services in isolation (API calls, state management, utilities)
- Mock HttpClient with HttpTestingController
- Test pipes and utility functions
- Target: 70%+ line coverage

**2. Component Tests (Angular Testing Library approach)**:
- Test component behavior via DOM interactions (not implementation details)
- Test all states: loading, empty, error, success
- Verify user interactions (click, input, navigation)
- Use TestBed with real/mock services as needed

**3. E2E Tests (Playwright)**:
- Critical user paths from spec user stories:
  - US1 (P1): Account selection → account detail navigation
  - US2 (P1): Transaction ledger review with filters
  - US3 (P2): Invoice list → sort/search
  - US4 (P2): Invoice detail → cross-navigation to ledger
  - US5 (P3): Metadata editing + save
  - US6 (P3): PDF download
- Cross-browser (Chromium + WebKit minimum)
- Headless in CI, headed for local debugging

**TDD Workflow**:
1. Write acceptance test from user story (E2E or component test)
2. Run test → verify FAIL (red)
3. Implement minimal code to pass test
4. Run test → verify PASS (green)
5. Refactor while keeping tests green

**Rationale**:
- Constitution mandates test-first development
- Three tiers provide different coverage levels (units, integration, end-to-end)
- Playwright is modern, fast, and reliable (specified in tech-specification-angular.md)

**Alternatives Considered**:
- Jest instead of Jasmine/Karma: Acceptable per tech spec, but Karma is Angular default (less setup)
- Cypress instead of Playwright: Rejected in favor of Playwright (better performance, multi-tab support)

---

### 8. Accessibility (a11y) Implementation

**Question**: How do we ensure the UI meets WCAG AA standards?

**Decision**: Built-in accessibility from component design phase

**Requirements**:
1. **Keyboard Navigation**: All interactive elements (buttons, links, inputs) accessible via Tab/Enter/Space
2. **ARIA Attributes**: 
   - Labels for form inputs
   - Roles for custom components (e.g., role="table" for custom table)
   - Live regions for dynamic content (loading states, error messages)
3. **Semantic HTML**: Use `<button>`, `<nav>`, `<main>`, `<table>` instead of `<div>` with click handlers
4. **Color Contrast**: WCAG AA minimum 4.5:1 for text (verify with Lighthouse)
5. **Focus Management**: Visible focus indicators, trap focus in modals

**Testing**:
- Automated: Lighthouse CI, aXe DevTools
- Manual: Tab through all interactive elements, verify screen reader announcements

**Rationale**:
- Constitution requires keyboard navigation and ARIA attributes
- Financial applications must be accessible to all users
- Accessibility is easier to build in than retrofit

**Alternatives Considered**:
- Third-party a11y library: Not needed (Angular + semantic HTML sufficient)

---

### 9. Tenant Isolation Implementation

**Question**: How do we enforce strict tenant isolation at the UI layer?

**Decision**: Multi-layered tenant enforcement

**Layers**:
1. **Route Guards**: TenantGuard verifies tenant context before activating routes
2. **HTTP Interceptor**: Inject X-Tenant-ID header on all API requests
3. **Service Layer**: All API calls require tenantId parameter
4. **Component Logic**: Display only data for current tenant (no client-side cross-tenant data)

**Flow**:
```
User authenticates → Tenant context established → 
Route guard checks tenant → HTTP interceptor adds header → 
Backend validates tenant ID → UI displays tenant-scoped data
```

**Rationale**:
- Constitution requirement: "Zero incidents of cross-tenant data leakage"
- Defense in depth (multiple layers prevent accidental leakage)
- Backend is authoritative (UI is defense layer, not source of truth)

**Alternatives Considered**:
- UI-only tenant filtering: Rejected as insufficient (backend must enforce)

---

### 10. PDF Download Implementation

**Question**: How should we implement invoice PDF download (US6 - P3)?

**Decision**: Backend-generated PDF with frontend download trigger

**Flow**:
1. User clicks "Download PDF" button on invoice detail page
2. Frontend calls GET /api/invoices/{invoiceId}/pdf (returns binary)
3. Create Blob from response, trigger browser download with filename
4. Show loading indicator during download, success message on completion

**Code Pattern**:
```typescript
downloadInvoicePdf(invoiceId: string): Observable<Blob> {
  return this.http.get(`/api/invoices/${invoiceId}/pdf`, {
    responseType: 'blob'
  }).pipe(
    tap(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    })
  );
}
```

**Rationale**:
- Backend is source of truth for invoice format (UI must not generate PDFs)
- Browser download API is simple and well-supported
- No need for PDF viewing library (just download)

**Alternatives Considered**:
- Client-side PDF generation (jsPDF): Rejected (violates "backend is authoritative" principle)
- PDF.js viewer: Deferred as out of scope for P3 (download-only for MVP)

---

## Summary

All technical unknowns resolved using Angular 17+ best practices, constitution principles, and tech-specification-angular.md standards. No NEEDS CLARIFICATION items remain. Ready to proceed to Phase 1 (Design & Contracts).

### Key Technology Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Framework | Angular 17+ standalone components | Modern pattern, less boilerplate, better tree-shaking |
| State Management | RxJS service facades | Simple, sufficient for read-heavy UI, no over-engineering |
| Styling | Tailwind CSS utility-first | Required by tech spec, rapid development, small bundle |
| HTTP | Angular HttpClient + interceptors | Built-in, type-safe, interceptors for cross-cutting concerns |
| Error Handling | Global handler + local states | Multi-layer defense, observability + UX |
| Performance | OnPush + lazy loading + trackBy | Meets <2s and <1s load targets |
| Testing | Jasmine/Karma + Playwright | TDD-ready, three-tier coverage |
| Accessibility | Semantic HTML + ARIA | WCAG AA compliance, keyboard navigation |
| Tenant Isolation | Guards + interceptors + backend validation | Defense in depth, zero leakage |
| PDF Download | Backend-generated, frontend download trigger | Backend is source of truth |

### Next Steps (Phase 1)

1. Create data-model.md (entities: Account, Ledger Entry, Invoice, Tenant)
2. Generate API contracts (OpenAPI specs for accounts, transactions, invoices APIs)
3. Write quickstart.md (setup instructions, run commands, environment config)
4. Update agent context (prerequiste/tech-specification-angular.md with learned patterns)
