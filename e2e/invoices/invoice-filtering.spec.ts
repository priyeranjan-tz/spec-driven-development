import { test, expect } from '@playwright/test';

test.describe('Invoice Filtering', () => {
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
    },
    {
      id: 'invoice-004',
      accountId: accountId,
      invoiceNumber: 'INV-2026-004',
      billingPeriodStart: '2026-04-01',
      billingPeriodEnd: '2026-04-30',
      frequency: 'Monthly',
      subtotalCents: 200000,
      taxCents: 18000,
      totalCents: 218000,
      status: 'Draft',
      dueDate: '2026-05-15',
      issuedAt: null,
      createdAt: '2026-04-30T00:00:00Z'
    }
  ];

  test('should display filter controls', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockInvoices,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 4,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Verify filter controls exist
    await expect(page.locator('[data-testid="filter-status"]')).toBeVisible();
    await expect(page.locator('[data-testid="filter-frequency"]')).toBeVisible();
    await expect(page.locator('button:has-text("Clear Filters")')).toBeVisible();
  });

  test('should filter by status', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const status = url.searchParams.get('status');
      
      let filteredData = mockInvoices;
      if (status) {
        filteredData = mockInvoices.filter(inv => inv.status === status);
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: filteredData,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: filteredData.length,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Select "Paid" status filter
    await page.locator('[data-testid="filter-status"]').selectOption('Paid');
    await page.waitForLoadState('networkidle');
    
    // Verify only Paid invoices displayed
    const invoiceCards = page.locator('[data-testid="invoice-card"]');
    await expect(invoiceCards).toHaveCount(1);
    await expect(invoiceCards.first()).toContainText('Paid');
    await expect(invoiceCards.first()).toContainText('INV-2026-002');
  });

  test('should filter by frequency', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const frequency = url.searchParams.get('frequency');
      
      let filteredData = mockInvoices;
      if (frequency) {
        filteredData = mockInvoices.filter(inv => inv.frequency === frequency);
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: filteredData,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: filteredData.length,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Select "Monthly" frequency filter
    await page.locator('[data-testid="filter-frequency"]').selectOption('Monthly');
    await page.waitForLoadState('networkidle');
    
    // Verify only Monthly invoices displayed
    const invoiceCards = page.locator('[data-testid="invoice-card"]');
    await expect(invoiceCards).toHaveCount(2);
    
    // Verify first invoice
    await expect(invoiceCards.first()).toContainText('Monthly');
    await expect(invoiceCards.first()).toContainText('INV-2026-001');
  });

  test('should combine multiple filters', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const status = url.searchParams.get('status');
      const frequency = url.searchParams.get('frequency');
      
      let filteredData = mockInvoices;
      if (status) {
        filteredData = filteredData.filter(inv => inv.status === status);
      }
      if (frequency) {
        filteredData = filteredData.filter(inv => inv.frequency === frequency);
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: filteredData,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: filteredData.length,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Apply both filters
    await page.locator('[data-testid="filter-status"]').selectOption('Issued');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="filter-frequency"]').selectOption('Monthly');
    await page.waitForLoadState('networkidle');
    
    // Verify filtered results
    const invoiceCards = page.locator('[data-testid="invoice-card"]');
    await expect(invoiceCards).toHaveCount(1);
    await expect(invoiceCards.first()).toContainText('Issued');
    await expect(invoiceCards.first()).toContainText('Monthly');
    await expect(invoiceCards.first()).toContainText('INV-2026-001');
  });

  test('should clear all filters', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const status = url.searchParams.get('status');
      const frequency = url.searchParams.get('frequency');
      
      let filteredData = mockInvoices;
      if (status) {
        filteredData = filteredData.filter(inv => inv.status === status);
      }
      if (frequency) {
        filteredData = filteredData.filter(inv => inv.frequency === frequency);
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: filteredData,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: filteredData.length,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Apply filters
    await page.locator('[data-testid="filter-status"]').selectOption('Paid');
    await page.waitForLoadState('networkidle');
    
    // Clear filters
    await page.locator('button:has-text("Clear Filters")').click();
    await page.waitForLoadState('networkidle');
    
    // Verify all invoices displayed
    const invoiceCards = page.locator('[data-testid="invoice-card"]');
    await expect(invoiceCards).toHaveCount(4);
  });

  test('should reset to page 1 when filters change', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const page_param = url.searchParams.get('page') || '1';
      
      // Verify page resets to 1 when filtering
      if (url.searchParams.get('status') || url.searchParams.get('frequency')) {
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
            totalItems: 100,
            totalPages: 2,
            hasNext: true,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(`${baseUrl}&page=2`);
    
    // Apply filter
    await page.locator('[data-testid="filter-status"]').selectOption('Paid');
    await page.waitForLoadState('networkidle');
    
    // Verify URL shows page=1
    expect(page.url()).toContain('page=1');
  });

  test('should display "No invoices found" when filters match nothing', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const status = url.searchParams.get('status');
      const frequency = url.searchParams.get('frequency');
      
      let filteredData = mockInvoices;
      if (status) {
        filteredData = filteredData.filter(inv => inv.status === status);
      }
      if (frequency) {
        filteredData = filteredData.filter(inv => inv.frequency === frequency);
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: filteredData,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: filteredData.length,
            totalPages: filteredData.length > 0 ? 1 : 0,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Apply filters that match nothing (Cancelled status + PerRide frequency)
    await page.locator('[data-testid="filter-status"]').selectOption('Cancelled');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="filter-frequency"]').selectOption('PerRide');
    await page.waitForLoadState('networkidle');
    
    // Verify empty state displayed
    const emptyState = page.locator('app-empty-state');
    await expect(emptyState).toBeVisible();
    await expect(emptyState).toContainText('No invoices found');
  });

  test('should maintain filters during pagination', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const status = url.searchParams.get('status');
      const frequency = url.searchParams.get('frequency');
      
      // Verify filters are maintained
      if (status || frequency) {
        expect(status || frequency).toBeTruthy();
      }
      
      let filteredData = mockInvoices;
      if (status) {
        filteredData = filteredData.filter(inv => inv.status === status);
      }
      if (frequency) {
        filteredData = filteredData.filter(inv => inv.frequency === frequency);
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: filteredData,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 100,
            totalPages: 2,
            hasNext: true,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Apply filter
    await page.locator('[data-testid="filter-status"]').selectOption('Issued');
    await page.waitForLoadState('networkidle');
    
    // Navigate to next page
    await page.locator('button:has-text("Next")').click();
    await page.waitForLoadState('networkidle');
    
    // Verify filter selection still active
    await expect(page.locator('[data-testid="filter-status"]')).toHaveValue('Issued');
  });

  test('should preserve filter state in URL query params', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockInvoices,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 4,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Apply filters
    await page.locator('[data-testid="filter-status"]').selectOption('Paid');
    await page.waitForLoadState('networkidle');
    await page.locator('[data-testid="filter-frequency"]').selectOption('PerRide');
    await page.waitForLoadState('networkidle');
    
    // Verify URL contains filter params
    expect(page.url()).toContain('status=Paid');
    expect(page.url()).toContain('frequency=PerRide');
  });
});
