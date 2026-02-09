import { test, expect } from '@playwright/test';

test.describe('Invoice Detail View', () => {
  const accountId = '123e4567-e89b-12d3-a456-426614174000';
  const invoiceId = '123e4567-e89b-12d3-a456-426614174001';
  const baseUrl = `http://localhost:4200/accounts/${accountId}?tab=invoices`;

  const mockInvoice = {
    id: invoiceId,
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
    createdAt: '2026-02-01T00:00:00Z',
    lineItems: [
      {
        id: 'line-001',
        invoiceId: invoiceId,
        rideId: 'ride-123',
        rideDate: '2026-01-05T10:30:00Z',
        fareCents: 2500,
        description: 'Ride from Downtown to Airport',
        createdAt: '2026-01-05T10:30:00Z'
      },
      {
        id: 'line-002',
        invoiceId: invoiceId,
        rideId: 'ride-456',
        rideDate: '2026-01-10T15:45:00Z',
        fareCents: 1800,
        description: 'Ride from Home to Office',
        createdAt: '2026-01-10T15:45:00Z'
      }
    ]
  };

  test('should load and display full invoiceDetails', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    // Verify invoice header information
    await expect(page.locator('[data-testid="invoice-number"]')).toContainText('INV-2026-001');
    await expect(page.locator('[data-testid="invoice-status"]')).toContainText('Issued');
    await expect(page.locator('[data-testid="billing-period"]')).toContainText('1/1/26');
    await expect(page.locator('[data-testid="billing-period"]')).toContainText('1/31/26');
    
    // Verify financial information
    await expect(page.locator('[data-testid="subtotal"]')).toContainText('$2,500.00');
    await expect(page.locator('[data-testid="tax"]')).toContainText('$225.00');
    await expect(page.locator('[data-testid="total"]')).toContainText('$2,725.00');
  });

  test('should display line items table', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    // Verify line items section exists
    await expect(page.locator('[data-testid="line-items-section"]')).toBeVisible();
    
    // Verify line item rows
    const lineItemRows = page.locator('[data-testid="line-item-row"]');
    await expect(lineItemRows).toHaveCount(2);
    
    // Verify first line item details
    const firstRow = lineItemRows.first();
    await expect(firstRow).toContainText('ride-123');
    await expect(firstRow).toContainText('$25.00');
    await expect(firstRow).toContainText('Downtown to Airport');
  });

  test('should display due date and issued date', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    await expect(page.locator('[data-testid="due-date"]')).toContainText('2/15/26');
    await expect(page.locator('[data-testid="issued-date"]')).toContainText('2/1/26');
  });

  test('should display frequency information', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    await expect(page.locator('[data-testid="frequency"]')).toContainText('Monthly');
  });

  test('should display loading spinner while fetching', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      // Delay response to show loading state
      await new Promise(resolve => setTimeout(resolve, 100));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    // Should show loading spinner
    const spinner = page.locator('app-loading-spinner');
    await expect(spinner).toBeVisible();
  });

  test('should handle 404 error for non-existent invoice', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invoice not found' })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    // Should display error state
    const errorState = page.locator('app-error-state');
    await expect(errorState).toBeVisible();
    await expect(errorState).toContainText('Invoice not found');
  });

  test('should display retry button in error state', async ({ page }) => {
    let requestCount = 0;
    
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
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
          body: JSON.stringify({ data: mockInvoice })
        });
      }
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    // Click retry button
    const retryButton = page.locator('button:has-text("Retry")');
    await expect(retryButton).toBeVisible();
    await retryButton.click();
    
    // Should show invoice details after successful retry
    await expect(page.locator('[data-testid="invoice-number"]')).toContainText('INV-2026-001');
  });

  test('should display back button', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    // Verify back button exists
    const backButton = page.locator('button:has-text("Back")');
    await expect(backButton).toBeVisible();
  });

  test('should navigate back to invoice list when back button clicked', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

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

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    // Click back button
    await page.locator('button:has-text("Back")').click();
    await page.waitForLoadState('networkidle');
    
    // Verify navigation back to invoice list
    expect(page.url()).toContain(`accounts/${accountId}`);
    expect(page.url()).toContain('tab=invoices');
    expect(page.url()).not.toContain(invoiceId);
  });
});
