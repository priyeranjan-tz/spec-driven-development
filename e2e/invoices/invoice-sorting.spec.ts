import { test, expect } from '@playwright/test';

test.describe('Invoice Sorting', () => {
  const accountId = '123e4567-e89b-12d3-a456-426614174000';
  const baseUrl = `http://localhost:4200/accounts/${accountId}?tab=invoices`;

  const mockInvoices = [
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
    },
    {
      id: 'invoice-003',
      accountId: accountId,
      invoiceNumber: 'INV-2026-003',
      billingPeriodStart: '2026-03-01',
      billingPeriodEnd: '2026-03-31',
      frequency: 'Weekly',
      subtotalCents: 350000,
      taxCents: 31500,
      totalCents: 381500,
      status: 'Overdue',
      dueDate: '2026-04-15',
      issuedAt: '2026-04-01T00:00:00Z',
      createdAt: '2026-04-01T00:00:00Z'
    }
  ];

  test('should display sortable column headers', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockInvoices,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 3,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Verify sortable headers exist
    await expect(page.locator('[data-testid="sort-invoice-number"]')).toBeVisible();
    await expect(page.locator('[data-testid="sort-due-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="sort-total"]')).toBeVisible();
    await expect(page.locator('[data-testid="sort-status"]')).toBeVisible();
  });

  test('should sort by invoice number ascending', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const sortBy = url.searchParams.get('sortBy');
      const sortOrder = url.searchParams.get('sortOrder');
      
      let sortedData = [...mockInvoices];
      if (sortBy === 'invoiceNumber' && sortOrder === 'asc') {
        sortedData.sort((a, b) => a.invoiceNumber.localeCompare(b.invoiceNumber));
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: sortedData,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 3,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Click invoice number header to sort
    await page.locator('[data-testid="sort-invoice-number"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify sorting indicator
    await expect(page.locator('[data-testid="sort-invoice-number"]')).toHaveAttribute('aria-sort', 'ascending');
  });

  test('should sort by invoice number descending on second click', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const sortBy = url.searchParams.get('sortBy');
      const sortOrder = url.searchParams.get('sortOrder');
      
      let sortedData = [...mockInvoices];
      if (sortBy === 'invoiceNumber' && sortOrder === 'desc') {
        sortedData.sort((a, b) => b.invoiceNumber.localeCompare(a.invoiceNumber));
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: sortedData,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 3,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Click twice to sort descending
    const sortButton = page.locator('[data-testid="sort-invoice-number"]');
    await sortButton.click();
    await page.waitForLoadState('networkidle');
    await sortButton.click();
    await page.waitForLoadState('networkidle');
    
    // Verify sorting indicator
    await expect(sortButton).toHaveAttribute('aria-sort', 'descending');
  });

  test('should sort by due date', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const sortBy = url.searchParams.get('sortBy');
      const sortOrder = url.searchParams.get('sortOrder');
      
      let sortedData = [...mockInvoices];
      if (sortBy === 'dueDate') {
        sortedData.sort((a, b) => {
          const comparison = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          return sortOrder === 'desc' ? -comparison : comparison;
        });
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: sortedData,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 3,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Click due date header to sort
    await page.locator('[data-testid="sort-due-date"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify sorting indicator
    await expect(page.locator('[data-testid="sort-due-date"]')).toHaveAttribute('aria-sort', 'ascending');
  });

  test('should sort by total amount', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const sortBy = url.searchParams.get('sortBy');
      const sortOrder = url.searchParams.get('sortOrder');
      
      let sortedData = [...mockInvoices];
      if (sortBy === 'totalCents') {
        sortedData.sort((a, b) => {
          const comparison = a.totalCents - b.totalCents;
          return sortOrder === 'desc' ? -comparison : comparison;
        });
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: sortedData,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 3,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Click total header to sort
    await page.locator('[data-testid="sort-total"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify sorting indicator
    await expect(page.locator('[data-testid="sort-total"]')).toHaveAttribute('aria-sort', 'ascending');
    
    // Verify first invoice has smallest total
    const firstCard = page.locator('[data-testid="invoice-card"]').first();
    await expect(firstCard).toContainText('$1,635.00');
  });

  test('should sort by status', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const sortBy = url.searchParams.get('sortBy');
      const sortOrder = url.searchParams.get('sortOrder');
      
      let sortedData = [...mockInvoices];
      if (sortBy === 'status') {
        sortedData.sort((a, b) => {
          const comparison = a.status.localeCompare(b.status);
          return sortOrder === 'desc' ? -comparison : comparison;
        });
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: sortedData,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 3,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Click status header to sort
    await page.locator('[data-testid="sort-status"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify sorting indicator
    await expect(page.locator('[data-testid="sort-status"]')).toHaveAttribute('aria-sort', 'ascending');
  });

  test('should reset to page 1 when sorting changes', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const page_param = url.searchParams.get('page') || '1';
      
      // Verify page resets to 1 when sorting
      if (url.searchParams.get('sortBy')) {
        expect(page_param).toBe('1');
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockInvoices,
          pagination: {
            page: parseInt(page_param),
            pageSize: 50,
            totalItems: 150,
            totalPages: 3,
            hasNext: true,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(`${baseUrl}&page=2`);
    
    // Click sort header
    await page.locator('[data-testid="sort-invoice-number"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify URL shows page=1
    expect(page.url()).toContain('page=1');
  });

  test('should maintain sort order during pagination', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const sortBy = url.searchParams.get('sortBy');
      const sortOrder = url.searchParams.get('sortOrder');
      
      // Verify sort params are maintained
      if (sortBy) {
        expect(sortBy).toBeTruthy();
        expect(sortOrder).toBeTruthy();
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockInvoices,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 150,
            totalPages: 3,
            hasNext: true,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Apply sort
    await page.locator('[data-testid="sort-total"]').click();
    await page.waitForLoadState('networkidle');
    
    // Navigate to next page
    await page.locator('button:has-text("Next")').click();
    await page.waitForLoadState('networkidle');
    
    // Verify sort indicator still active
    await expect(page.locator('[data-testid="sort-total"]')).toHaveAttribute('aria-sort', 'ascending');
  });
});
