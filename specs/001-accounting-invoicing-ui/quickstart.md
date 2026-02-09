# Quickstart: Accounting & Invoicing UI

**Feature**: Accounting & Invoicing UI  
**Branch**: 001-accounting-invoicing-ui  
**Date**: 2026-02-06  
**Phase**: 1 (Design & Contracts)

## Overview

This guide provides step-by-step instructions to set up, run, and test the Accounting & Invoicing UI Angular application locally.

---

## Prerequisites

### Required Software

- **Node.js**: 20.x LTS ([download](https://nodejs.org/))
  - Verify: `node --version` (should output v20.x.x)
- **pnpm**: Latest version (package manager)
  - Install: `npm install -g pnpm`
  - Verify: `pnpm --version`
- **Git**: Latest version
  - Verify: `git --version`

### Optional but Recommended

- **VS Code**: Latest version with extensions:
  - Angular Language Service
  - ESLint
  - Prettier
  - Playwright Test for VS Code
- **Browser**: Chrome or Firefox (latest version) for development

---

## Initial Setup

### 1. Clone Repository and Checkout Branch

```bash
# Clone repository (if not already cloned)
git clone <repository-url>
cd <repository-name>

# Checkout feature branch
git checkout 001-accounting-invoicing-ui
```

### 2. Install Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install all dependencies using pnpm
pnpm install

# This installs:
# - Angular 17+
# - RxJS
# - Tailwind CSS
# - Jasmine + Karma (unit tests)
# - Playwright (E2E tests)
# - ESLint + Prettier
```

### 3. Configure Environment Variables

Create `.env` file in `frontend/` directory:

```env
# API Base URL (update based on environment)
API_BASE_URL=https://api.example.com/v1

# Tenant ID (set based on test tenant)
DEFAULT_TENANT_ID=00000000-0000-0000-0000-000000000001

# Auth token (set based on test user)
# Note: In production, this comes from authentication service
AUTH_TOKEN=your-test-jwt-token
```

**Security Note**: Never commit `.env` file with real credentials. Use `.env.example` for documentation.

###4. Verify Angular CLI

```bash
# Check Angular CLI version
npx ng version

# Should output Angular CLI 17+ and Angular Core 17+
```

---

## Development Workflow

### Start Development Server

```bash
# From frontend/ directory
pnpm start

# Or using Angular CLI directly
npx ng serve

# Server starts at http://localhost:4200
# Hot reload enabled (changes auto-reload browser)
```

**Access Application**:
- Open browser to `http://localhost:4200`
- Should see account list page (requires backend API running)

### Build for Production

```bash
# Production build with AOT compilation
pnpm build

# Or
npx ng build --configuration production

# Output: frontend/dist/
# Bundle size targets: 
#   - Initial bundle: <500KB gzipped
#   - Lazy chunks: <250KB gzipped each
```

---

## Testing

### Unit Tests (Jasmine + Karma)

```bash
# Run all unit tests
pnpm test

# Or
npx ng test

# Run tests once (CI mode)
pnpm test:ci
npx ng test --watch=false --browsers=ChromeHeadless

# Run tests with coverage
pnpm test:coverage
npx ng test --watch=false --code-coverage

# Coverage output: frontend/coverage/
# Target thresholds: 70%+ lines, 60%+ branches
```

### E2E Tests (Playwright)

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests (headless)
pnpm e2e

# Or
npx playwright test

# Run E2E tests in UI mode (headed, interactive)
pnpm e2e:ui
npx playwright test --ui

# Run specific test file
npx playwright test e2e/accounts/account-selection.spec.ts

# Debug E2E tests
npx playwright test --debug
```

**E2E Test Coverage**:
- US1 (P1): Account selection → account detail navigation
- US2 (P1): Transaction ledger review with filters
- US3 (P2): Invoice list → sort/search
- US4 (P2): Invoice detail → cross-navigation to ledger
- US5 (P3): Metadata editing + save
- US6 (P3): PDF download

### Linting and Formatting

```bash
# Run ESLint (check for code quality issues)
pnpm lint
npx ng lint

# Fix auto-fixable ESLint issues
pnpm lint:fix
npx ng lint --fix

# Check Prettier formatting
pnpm format:check
npx prettier --check "src/**/*.{ts,html,css,json}"

# Fix Prettier formatting
pnpm format
npx prettier --write "src/**/*.{ts,html,css,json}"
```

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/              # Singleton services (HTTP, errors, tenant)
│   │   ├── shared/            # Reusable UI components (buttons, tables, etc.)
│   │   ├── features/          # Feature modules (accounts, transactions, invoices)
│   │   │   ├── accounts/
│   │   │   ├── transactions/
│   │   │   └── invoices/
│   │   ├── app.routes.ts      # Main route configuration
│   │   └── app.config.ts      # App-wide providers
│   ├── styles.css             # Tailwind entry + global styles
│   └── main.ts                # Application entry point
├── e2e/                       # Playwright E2E tests
├── angular.json               # Angular CLI configuration
├── tailwind.config.ts         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
├── .eslintrc.cjs              # ESLint configuration
├── .prettierrc                # Prettier configuration
└── package.json               # Dependencies and scripts
```

---

## Common Development Tasks

### Generate New Component

```bash
# Generate standalone component with OnPush change detection
npx ng generate component features/accounts/components/account-summary --standalone --change-detection=OnPush

# Shorthand
npx ng g c features/accounts/components/account-summary --standalone --change-detection=OnPush
```

### Generate New Service

```bash
# Generate service provided in root
npx ng generate service core/services/logger

# Shorthand
npx ng g s core/services/logger
```

### Add New Route

1. Create route component in feature's `pages/` directory
2. Add route to feature's `.routes.ts` file
3. Lazy load feature route in `app.routes.ts`:

```typescript
// app.routes.ts
export const routes: Routes = [
  {
    path: 'accounts',
    loadChildren: () => import('./features/accounts/accounts.routes').then(m => m.ACCOUNTS_ROUTES)
  }
];
```

---

## Troubleshooting

### Development Server Won't Start

**Issue**: `pnpm start` fails with port conflict

**Solution**:
```bash
# Kill process on port 4200
# Windows:
netstat -ano | findstr :4200
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti :4200 | xargs kill -9

# Or use different port
npx ng serve --port 4300
```

### Dependencies Won't Install

**Issue**: `pnpm install` fails

**Solution**:
```bash
# Clear pnpm cache
pnpm store prune

# Remove node_modules and lock file
rm -rf node_modules pnpm-lock.yaml

# Reinstall
pnpm install
```

### Tests Fail with API Errors

**Issue**: Unit tests fail because backend API is unavailable

**Solution**: Unit tests should mock HttpClient. Check that tests use `HttpTestingController`:

```typescript
import { HttpTestingController } from '@angular/common/http/testing';

// In test setup
TestBed.configureTestingModule({
  imports: [HttpClientTestingModule]
});

httpMock = TestBed.inject(HttpTestingController);
```

### E2E Tests Fail with Navigation Errors

**Issue**: Playwright tests fail with "net::ERR_CONNECTION_REFUSED"

**Solution**: Ensure development server is running:
```bash
# Terminal 1: Start dev server
pnpm start

# Terminal 2: Run E2E tests
pnpm e2e
```

Or configure Playwright to start dev server automatically (`playwright.config.ts`):
```typescript
webServer: {
  command: 'pnpm start',
  port: 4200,
  reuseExistingServer: !process.env.CI
}
```

---

## Deployment

### Build for Staging/Production

```bash
# Staging build
npx ng build --configuration staging

# Production build
npx ng build --configuration production

# Output directory: frontend/dist/
```

### Performance Verification

```bash
# Check bundle sizes
ls -lh dist/**/*.js

# Verify budgets (should pass without warnings)
# Budgets defined in angular.json under projects > budgets
```

### Deploy to Server

```bash
# Copy dist/ contents to web server
# Example: AWS S3 + CloudFront, Azure Static Web Apps, Netlify

# Example: Deploy to AWS S3
aws s3 sync dist/ s3://your-bucket-name/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

---

## CI/CD Configuration

### GitHub Actions Example

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test:ci
      - run: pnpm build
      - run: npx playwright install
      - run: pnpm e2e
```

---

## Additional Resources

- **Angular Documentation**: https://angular.io/docs
- **Tailwind CSS Documentation**: https://tailwindcss.com/docs
- **Playwright Documentation**: https://playwright.dev/docs/intro
- **Project Constitution**: ../../.specify/memory/constitution.md
- **Tech Specification**: ../../prerequiste/tech-specification-angular.md
- **API Contracts**: ./contracts/ (OpenAPI specs)
- **Data Model**: ./data-model.md

---

## Next Steps

After setup:
1. Review [data-model.md](./data-model.md) for entity definitions
2. Review API contracts in [contracts/](./contracts/) directory
3. Review [spec.md](./spec.md) for user stories and acceptance criteria
4. Follow TDD workflow: Write tests → Verify FAIL → Implement → Verify PASS
5. Refer to [tasks.md](./tasks.md) (when generated) for implementation tasks

---

## Support

For questions or issues:
- Check troubleshooting section above
- Review project constitution and tech specification
- Consult Angular documentation for framework-specific questions
- Reach out to team lead or senior developer
