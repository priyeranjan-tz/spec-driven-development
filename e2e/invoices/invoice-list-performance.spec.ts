import { test, expect } from '@playwright/test';

test.describe('Invoice List Performance', () => {
  const accountId = '123e4567-e89b-12d3-a456-426614174000';
  const baseUrl = `http://localhost:4200/accounts/${accountId}?tab=invoices`;

  // Helper to generate mock invoice data
  function generateMockInvoices(count: number) {
    const statuses = ['Draft', 'Issued', 'Paid', 'Overdue', 'Cancelled'];
    const frequencies = ['PerRide', 'Daily', 'Weekly', 'Monthly'];
    
    return Array.from({ length: count }, (_, i) => ({
      id: `invoice-${i + 1}`,
      accountId: accountId,
      invoiceNumber: `INV-2026-${String(i + 1).padStart(4, '0')}`,
      billingPeriodStart: '2026-01-01',
      billingPeriodEnd: '2026-01-31',
      frequency: frequencies[i % frequencies.length],
      subtotalCents: Math.floor(Math.random() * 1000000),
      taxCents: Math.floor(Math.random() * 100000),
      totalCents: Math.floor(Math.random() * 1100000),
      status: statuses[i % statuses.length],
      dueDate: `2026-02-${String((i % 28) + 1).padStart(2, '0')}`,
      issuedAt: '2026-02-01T00:00:00Z',
      createdAt: '2026-02-01T00:00:00Z'
    }));
  }

  test('should load 500 invoices within 1 second', async ({ page }) => {
    const mockInvoices = generateMockInvoices(500);
    
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockInvoices.slice(0, 50), // First page
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 500,
            totalPages: 10,
            hasNext: true,
            hasPrevious: false
          }
        })
      });
    });

    const startTime = Date.now();
    await page.goto(baseUrl);
    
    // Wait for invoice cards to be visible
    await page.locator('[data-testid="invoice-card"]').first().waitFor();
    const endTime = Date.now();
    
    const loadTime = endTime - startTime;
    console.log(`Load time: ${loadTime}ms`);
    
    // Verify load time is under 1 second (1000ms)
    expect(loadTime).toBeLessThan(1000);
    
    // Verify invoices are displayed
    const invoiceCards = page.locator('[data-testid="invoice-card"]');
    await expect(invoiceCards).toHaveCount(50);
  });

  test('should handle rapid pagination through large dataset', async ({ page }) => {
    const mockInvoices = generateMockInvoices(500);
    
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      const url = new URL(route.request().url());
      const page_param = parseInt(url.searchParams.get('page') || '1');
      const startIdx = (page_param - 1) * 50;
      const endIdx = startIdx + 50;
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockInvoices.slice(startIdx, endIdx),
          pagination: {
            page: page_param,
            pageSize: 50,
            totalItems: 500,
            totalPages: 10,
            hasNext: page_param < 10,
            hasPrevious: page_param > 1
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Click Next 5 times rapidly
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      await page.locator('button:has-text("Next")').click();
      await page.locator('[data-testid="invoice-card"]').first().waitFor();
      const endTime = Date.now();
      
      const loadTime = endTime - startTime;
      console.log(`Page ${i + 2} load time: ${loadTime}ms`);
      
      // Each pagination should be fast (<500ms)
      expect(loadTime).toBeLessThan(500);
    }
    
    // Verify we're on page 6
    expect(page.url()).toContain('page=6');
  });

  test('should efficiently render invoice cards with trackBy', async ({ page }) => {
    const mockInvoices = generateMockInvoices(50);
    
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockInvoices,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 50,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    
    // Get initial card elements
    const initialCards = await page.locator('[data-testid="invoice-card"]').all();
    const initialCardIds = await Promise.all(
      initialCards.map(card => card.getAttribute('data-invoice-id'))
    );
    
    // Trigger re-render by changing filters
    await page.locator('[data-testid="filter-status"]').selectOption('All');
    await page.waitForLoadState('networkidle');
    
    // Get card elements after re-render
    const updatedCards = await page.locator('[data-testid="invoice-card"]').all();
    const updatedCardIds = await Promise.all(
      updatedCards.map(card => card.getAttribute('data-invoice-id'))
    );
    
    // Verify same invoice IDs (trackBy prevents full re-render)
    expect(updatedCardIds).toEqual(initialCardIds);
  });

  test('should apply filters quickly on large dataset', async ({ page }) => {
    const mockInvoices = generateMockInvoices(500);
    
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
          data: filteredData.slice(0, 50),
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: filteredData.length,
            totalPages: Math.ceil(filteredData.length / 50),
            hasNext: filteredData.length > 50,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    // Apply filter and measure time
    const startTime = Date.now();
    await page.locator('[data-testid="filter-status"]').selectOption('Paid');
    await page.locator('[data-testid="invoice-card"]').first().waitFor();
    const endTime = Date.now();
    
    const filterTime = endTime - startTime;
    console.log(`Filter time: ${filterTime}ms`);
    
    // Filter should apply quickly (<500ms)
    expect(filterTime).toBeLessThan(500);
  });

  test('should handle sort operations efficiently', async ({ page }) => {
    const mockInvoices = generateMockInvoices(500);
    
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
          data: sortedData.slice(0, 50),
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 500,
            totalPages: 10,
            hasNext: true,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    // Apply sort and measure time
    const startTime = Date.now();
    await page.locator('[data-testid="sort-total"]').click();
    await page.locator('[data-testid="invoice-card"]').first().waitFor();
    const endTime = Date.now();
    
    const sortTime = endTime - startTime;
    console.log(`Sort time: ${sortTime}ms`);
    
    // Sort should apply quickly (<500ms)
    expect(sortTime).toBeLessThan(500);
  });

  test('should maintain smooth scrolling with many cards', async ({ page }) => {
    const mockInvoices = generateMockInvoices(50);
    
    await page.route('**/api/tenants/*/accounts/*/invoices*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockInvoices,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 50,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(baseUrl);
    await page.waitForLoadState('networkidle');
    
    // Scroll to bottom
    const startTime = Date.now();
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(100); // Small delay for scroll
    const endTime = Date.now();
    
    const scrollTime = endTime - startTime;
    console.log(`Scroll time: ${scrollTime}ms`);
    
    // Scroll should be instant (<200ms)
    expect(scrollTime).toBeLessThan(200);
    
    // Verify last card is visible
    const lastCard = page.locator('[data-testid="invoice-card"]').last();
    await expect(lastCard).toBeVisible();
  });
});
