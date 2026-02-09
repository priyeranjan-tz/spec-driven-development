# Accounting & Invoicing UI

A tenant-scoped Angular web application providing finance and operations users with transparent visibility into financial transactions and invoices. This frontend application consumes the backend Dual-Entry Accounting Service API for read-heavy operational workflows.

## 🎯 Features

### Priority 1 (P1) - MVP
- **Account Selection**: Browse and select accounts within a tenant for financial review
- **Transaction Ledger Review**: View ledger entries with filtering, sorting, and pagination

### Priority 2 (P2) - Production Critical
- **Invoice List & Search**: Browse invoices with filtering by date, status, amount
- **Invoice Detail View**: Detailed invoice information with cross-references to ledger entries

### Priority 3 (P3) - Full Feature Set
- **Invoice Metadata Editing**: Edit notes, internal reference, and billing contact while protecting financial data
- **Invoice PDF Download**: Export invoices as PDF files for sharing, archiving, and printing

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18+ or v20+ (LTS recommended)
- **npm**: v9+ (comes with Node.js)
- **Angular CLI**: v17+

```bash
npm install -g @angular/cli
```

### Installation

1. **Clone the repository**:
```bash
git clone <repository-url>
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Configure environment**:
   - Copy `src/environments/environment.example.ts` to `src/environments/environment.ts`
   - Update `apiBaseUrl` to point to your backend API (default: `http://localhost:5000/api`)

4. **Start development server**:
```bash
npm start
# or
ng serve
```

5. **Open browser**: Navigate to `http://localhost:4200/`

## 📁 Project Architecture

### Feature-Based Structure

```
src/app/
├── core/                    # Singleton services, guards, interceptors
│   ├── services/
│   │   ├── tenant.service.ts          # Tenant context management
│   │   └── http.service.ts            # HTTP client with interceptors
│   └── guards/
│       └── auth.guard.ts              # Route authentication
│
├── features/                # Domain-driven feature modules
│   ├── accounts/            # Account selection feature
│   │   ├── components/
│   │   ├── services/
│   │   └── models/
│   ├── transactions/        # Ledger entry review feature
│   │   ├── components/
│   │   ├── services/
│   │   └── models/
│   └── invoices/            # Invoice management feature
│       ├── components/
│       │   ├── invoice-list/
│       │   ├── invoice-detail/
│       │   ├── invoice-metadata-editor/
│       │   └── pdf-download-button/
│       ├── services/
│       └── models/
│
└── shared/                  # Reusable UI components and utilities
    ├── components/
    │   ├── loading-spinner/
    │   ├── error-state/
    │   ├── pagination/
    │   └── date-range-picker/
    ├── pipes/
    │   ├── currency-format.pipe.ts
    │   └── date-format.pipe.ts
    └── models/
```

### Design Principles

- **Standalone Components**: Angular 17+ standalone component pattern (no NgModules)
- **OnPush Change Detection**: All components use `ChangeDetectionStrategy.OnPush` for performance
- **Lazy Loading**: Feature routes loaded on-demand to optimize initial bundle size
- **Feature Isolation**: Features don't import each other directly; communicate via services
- **Domain-Driven Design**: Code organized by business domain (accounts, transactions, invoices)

## 🏗️ Technical Stack

| Category | Technology | Version |
|----------|-----------|---------|
| **Framework** | Angular | 17+ |
| **Language** | TypeScript | 5.9.2 |
| **State Management** | RxJS | 7.8.0 |
| **Styling** | Tailwind CSS | 4.1.18 |
| **HTTP Client** | @angular/common/http | 17+ |
| **Unit Testing** | Jasmine + Karma | Latest |
| **E2E Testing** | Playwright | 1.58.1 |
| **Build Tool** | Angular CLI + Vite | 21.1.3 |

### Key Angular Features Used

- **Signals**: For reactive component state management
- **Control Flow Syntax**: `@if`, `@for`, `@switch` for cleaner templates
- **inject() Function**: Dependency injection in component constructors
- **Async Pipe**: Automatic subscription management for Observables
- **Reactive Forms**: For invoice metadata editing with validation
- **HTTP Interceptors**: Request/response transformation, error handling
- **Route Guards**: Authentication and authorization protection

## 🧪 Testing

### Unit Tests (Jasmine + Karma)

Run all unit tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

**Coverage Targets**:
- Lines: 70%+
- Branches: 60%+
- Functions: 70%+

### E2E Tests (Playwright)

Install Playwright browsers (first time only):
```bash
npx playwright install
```

Run all E2E tests:
```bash
npm run e2e
```

Run E2E tests in headed mode (see browser):
```bash
npm run e2e:headed
```

Run specific test file:
```bash
npx playwright test e2e/invoices/invoice-list.spec.ts
```

**E2E Test Coverage**:
- Account selection workflow
- Ledger entry filtering and pagination
- Invoice list with search and sorting
- Invoice detail view navigation
- Metadata editing with validation
- PDF download with filename verification
- Concurrent operations and error handling

### Test-Driven Development (TDD)

All features follow strict TDD workflow:
1. **Write E2E tests FIRST** (they should FAIL)
2. **Write unit tests** for services and components
3. **Implement feature** until tests PASS
4. **Refactor** while keeping tests green

## 🔧 Development Scripts

```bash
# Start development server
npm start                    # Runs ng serve on http://localhost:4200

# Build for production
npm run build               # Creates optimized production build in dist/

# Build with stats analysis
npm run build:stats         # Generates stats.json for bundle analysis

# Analyze bundle size
npm run analyze             # Opens webpack-bundle-analyzer

# Lint code
npm run lint                # Runs ESLint on all TypeScript files

# Format code
npm run format              # Runs Prettier on all source files

# Type check
npm run type-check          # Runs TypeScript compiler without emitting files

# Generate component
ng generate component features/invoices/components/new-component

# Generate service
ng generate service features/invoices/services/new-service
```

## 🌐 API Integration

### Backend API Configuration

The application expects a RESTful backend API with the following endpoints:

```
Base URL: http://localhost:5000/api

GET    /tenants/:tenantId/accounts
GET    /tenants/:tenantId/accounts/:accountId
GET    /tenants/:tenantId/accounts/:accountId/ledger-entries
GET    /tenants/:tenantId/accounts/:accountId/ledger-entries/:entryId
GET    /tenants/:tenantId/accounts/:accountId/invoices
GET    /tenants/:tenantId/accounts/:accountId/invoices/:invoiceId
PATCH  /tenants/:tenantId/accounts/:accountId/invoices/:invoiceId/metadata
GET    /tenants/:tenantId/accounts/:accountId/invoices/:invoiceId/pdf
```

### HTTP Interceptors

- **Tenant Context**: Automatically injects tenant ID from URL route
- **Error Handling**: Global error transformation and logging
- **Correlation IDs**: Propagates `X-Correlation-ID` header for request tracing
- **Loading Indicators**: Tracks in-flight requests for global loading state

## 📊 Performance Optimization

### Implemented Optimizations

- **OnPush Change Detection**: Prevents unnecessary change detection cycles
- **Lazy Loading**: Routes loaded on-demand (reduces initial bundle by ~40%)
- **trackBy Functions**: Optimizes list rendering in *ngFor loops
- **Pure Pipes**: All custom pipes are pure for better performance
- **Async Pipe**: Prevents memory leaks from manual subscriptions
- **RxJS Operators**: takeUntilDestroyed() for automatic cleanup

### Performance Goals

| Metric | Target | Notes |
|--------|--------|-------|
| Ledger Load | <2s | 90 days, 1000 transactions |
| Invoice List Load | <1s | 500 invoices with filters |
| Full Navigation Flow | <10s | Login → Account → Ledger |
| PDF Download | <5s | Invoice with 100 line items |
| Bundle Size (Initial) | <300KB | Gzipped main bundle |
| Bundle Size (Lazy Chunks) | <150KB | Per feature module |

### Bundle Analysis

```bash
npm run build:stats
npm run analyze
```

Opens webpack-bundle-analyzer to visualize bundle composition.

## ♿ Accessibility

### WCAG AA Compliance

- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **ARIA Labels**: Proper labels for screen readers on all control elements
- **Focus Management**: Visible focus indicators, logical tab order
- **Semantic HTML**: Proper heading hierarchy, landmark regions
- **Color Contrast**: Minimum 4.5:1 contrast ratio for text
- **Error Messages**: Associated with form fields via aria-describedby

Test with:
```bash
npm run a11y                # Runs axe-core accessibility audit
```

## 🔒 Security

### Implemented Security Measures

- **XSS Prevention**: Angular's built-in sanitization for user input
- **CSRF Protection**: CSRF token in HTTP interceptor for state-changing operations
- **Content Security Policy**: CSP headers configured in index.html
- **Secure Headers**: HTTP interceptor adds security headers
- **Input Validation**: Client-side validation for all user input
- **Filename Sanitization**: Prevents path traversal in PDF downloads
- **Tenant Isolation**: Strict tenant ID validation on all API calls

### Security Best Practices

- Never commit sensitive data (use `.env` files)
- Always sanitize user input before rendering
- Use Angular's DomSanitizer for dynamic HTML
- Implement proper authentication guards on routes
- Validate API responses before using data

## 🐛 Troubleshooting

### Common Issues

**Issue**: `Cannot find module '@angular/core'`
- **Solution**: Run `npm install` to install dependencies

**Issue**: Port 4200 already in use
- **Solution**: Run on different port: `ng serve --port 4300`

**Issue**: E2E tests fail with "browser not found"
- **Solution**: Run `npx playwright install` to install browsers

**Issue**: API calls return CORS errors
- **Solution**: Ensure backend server has CORS enabled for `http://localhost:4200`

**Issue**: Tenant context not loading
- **Solution**: Verify tenant ID is in route: `/tenant/:tenantId/accounts`

### Debug Mode

Enable verbose logging:
```bash
ng serve --verbose
```

Enable source maps in production:
```bash
ng build --source-map
```

## 📚 Additional Resources

- [Angular Documentation](https://angular.dev)
- [Angular CLI Reference](https://angular.dev/tools/cli)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [RxJS Documentation](https://rxjs.dev)
- [Playwright Documentation](https://playwright.dev)
- [Project Specification](../specs/001-accounting-invoicing-ui/spec.md)
- [Implementation Plan](../specs/001-accounting-invoicing-ui/plan.md)

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/my-feature`
2. Write failing tests first (TDD)
3. Implement feature until tests pass
4. Run linter: `npm run lint`
5. Run tests: `npm test && npm run e2e`
6. Commit with descriptive message
7. Push and create pull request

### Code Standards

- **TypeScript**: Strict mode enabled, no `any` types
- **Component Structure**: Template, styles, tests in separate files
- **Naming Conventions**: Use Angular style guide naming
- **Comments**: JSDoc for all public APIs
- **Git Commits**: Conventional commits format

## 📄 License

[Add your license here]

## 📞 Support

For questions or issues, please [open an issue](https://github.com/your-repo/issues) on GitHub.

