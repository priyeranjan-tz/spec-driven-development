import { test, expect } from '@playwright/test';

test.describe('Invoice List View', () => {
  const accountId = '123e4567-e89b-12d3-a456-426614174000';
  const baseUrl = `http://localhost:4200/accounts/${accountId}?tab=invoices`;

  test('should display loading spinner while fetching invoices', async ({ page }) => {
    await page.goto(baseUrl);
    
    // Should show loading spinner
    const spinner = page.locator('app-loading-spinner');
    await expect(spinner).toBeVisible();
  });

  test('should display empty state when no invoices exist', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [],
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Should display empty state
    const emptyState = page.locator('app-empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No invoices found');
  });

  test('should display invoice list with all fields', async ({ page }) => {
    // Mock invoice data
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [
            {
              id: 'invoice-001',
              accountId: accountId,
              invoiceNumber: 'INV-2026-001',
              billingPeriodStart: '2026-01-01',
              billingPeriodEnd: '2026-01-31',
              frequency: 'Monthly',
              subtotalCents: 250000,
              taxCents: 22500,
              totalCents: 272500,
              status: 'Issued',
              dueDate: '2026-02-15',
              issuedAt: '2026-02-01T00:00:00Z',
              createdAt: '2026-02-01T00:00:00Z'
            },
            {
              id: 'invoice-002',
              accountId: accountId,
              invoiceNumber: 'INV-2026-002',
              billingPeriodStart: '2026-02-01',
              billingPeriodEnd: '2026-02-28',
              frequency: 'PerRide',
              subtotalCents: 150000,
              taxCents: 13500,
              totalCents: 163500,
              status: 'Paid',
              dueDate: '2026-03-15',
              issuedAt: '2026-03-01T00:00:00Z',
              paidAt: '2026-03-10T00:00:00Z',
              createdAt: '2026-03-01T00:00:00Z'
            }
          ],
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 2,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Should display invoice cards
    const invoiceCards = page.locator('[data-testid="invoice-card"]');
    await expect(invoiceCards).toHaveCount(2);
    
    // Verify first invoice details
    const firstCard = invoiceCards.first();
    await expect(firstCard).toContainText('INV-2026-001');
    await expect(firstCard).toContainText('$2,725.00');
    await expect(firstCard).toContainText('Issued');
    await expect(firstCard).toContainText('Monthly');
  });

  test('should display error state when API fails', async ({ page }) => {
    // Mock API error
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.goto(baseUrl);
    
    // Should display error state
    const errorState = page.locator('app-error-state');
    await expect(errorState).toBeVisible();
    await expect(errorState).toContainText('Failed to load invoices');
  });

  test('should display retry button in error state', async ({ page }) => {
    let requestCount = 0;
    
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      requestCount++;
      
      if (requestCount === 1) {
        // First request fails
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Internal Server Error' })
        });
      } else {
        // Second request succeeds
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [],
            pagination: {
              page: 1,
              pageSize: 50,
              totalItems: 0,
              totalPages: 0,
              hasNext: false,
              hasPrevious: false
            }
          })
        });
      }
    });

    await page.goto(baseUrl);
    
    // Click retry button
    const retryButton = page.locator('button:has-text("Retry")');
    await expect(retryButton).toBeVisible();
    await retryButton.click();
    
    // Should show empty state after successful retry
    const emptyState = page.locator('app-empty-state');
    await expect(emptyState).toBeVisible();
  });

  test('should navigate through pagination for large datasets', async ({ page }) => {
    // Mock invoice data with pagination
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const page_param = url.searchParams.get('page') || '1';
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: Array.from({ length: 50 }, (_, i) => ({
            id: `invoice-${page_param}-${i + 1}`,
            accountId: accountId,
            invoiceNumber: `INV-2026-${String(i + 1).padStart(3, '0')}`,
            billingPeriodStart: '2026-01-01',
            billingPeriodEnd: '2026-01-31',
            frequency: 'Monthly',
            subtotalCents: 100000,
            taxCents: 9000,
            totalCents: 109000,
            status: 'Issued',
            dueDate: '2026-02-15',
            issuedAt: '2026-02-01T00:00:00Z',
            createdAt: '2026-02-01T00:00:00Z'
          })),
          pagination: {
            page: parseInt(page_param),
            pageSize: 50,
            totalItems: 150,
            totalPages: 3,
            hasNext: parseInt(page_param) < 3,
            hasPrevious: parseInt(page_param) > 1
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Should display pagination controls
    const nextButton = page.locator('button:has-text("Next")');
    await expect(nextButton).toBeVisible();
    await expect(nextButton).toBeEnabled();
    
    // Click next to go to page 2
    await nextButton.click();
    await page.waitForLoadState('networkidle');
    
    // Verify page 2 loaded
    const invoiceCards = page.locator('[data-testid="invoice-card"]');
    await expect(invoiceCards).toHaveCount(50);
    
    // Previous button should now be enabled
    const prevButton = page.locator('button:has-text("Previous")');
    await expect(prevButton).toBeEnabled();
  });
});
