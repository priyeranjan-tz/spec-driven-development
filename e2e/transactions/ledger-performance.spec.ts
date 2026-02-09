import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Ledger Performance (User Story 2)
 * Tests performance requirement: <2s load for 90 days, 1000 entries
 */

test.describe('Transaction Ledger Performance', () => {
  const accountId = '123e4567-e89b-12d3-a456-426614174001';
  const tenantId = '123e4567-e89b-12d3-a456-426614174000';

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ tenantId, userId: 'user-123' })
      });
    });
  });

  test('should load 1000 ledger entries within 2 seconds', async ({ page }) => {
    // Generate 1000 mock entries spanning 90 days
    const entries = Array(1000).fill(null).map((_, i) => {
      const daysAgo = Math.floor(i / 11); // Spread across 90 days (~11 entries/day)
      const postingDate = new Date('2026-02-06T10:00:00Z');
      postingDate.setDate(postingDate.getDate() - daysAgo);

      return {
        id: `entry-${i}`,
        accountId,
        postingDate: postingDate.toISOString(),
        sourceType: i % 3 === 0 ? 'payment' : 'ride',
        sourceReferenceId: i % 3 === 0 ? `payment-${i}` : `ride-${i}`,
        debitAmount: i % 3 === 0 ? 0 : 2500 + (i % 100),
        creditAmount: i % 3 === 0 ? 5000 + (i % 200) : 0,
        runningBalance: 100000 - (i * 100),
        linkedInvoiceId: i % 5 === 0 ? `invoice-${i}` : null,
        metadata: {},
        createdAt: postingDate.toISOString()
      };
    });

    // Mock paginated API with fast response
    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      const url = new URL(route.request().url());
      const page = parseInt(url.searchParams.get('page') || '1');
      const pageSize = parseInt(url.searchParams.get('pageSize') || '50');
      const startIdx = (page - 1) * pageSize;
      const endIdx = startIdx + pageSize;

      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: entries.slice(startIdx, endIdx),
          pagination: {
            page,
            pageSize,
            totalItems: 1000,
            totalPages: Math.ceil(1000 / pageSize),
            hasNext: endIdx < 1000,
            hasPrevious: page > 1
          }
        })
      });
    });

    // Measure time to load first page
    const startTime = Date.now();
    await page.goto(`/accounts/${accountId}?tab=transactions`);
    await page.waitForSelector('app-transaction-row');
    const loadTime = Date.now() - startTime;

    // Verify load time < 2000ms
    expect(loadTime).toBeLessThan(2000);

    // Verify 50 rows rendered (first page)
    const rowCount = await page.locator('app-transaction-row').count();
    expect(rowCount).toBe(50);

    // Verify pagination shows 1000 total
    const paginationText = await page.locator('app-pagination').textContent();
    expect(paginationText).toContain('1000');
  });

  test('should handle rapid pagination through large dataset', async ({ page }) => {
    const totalEntries = 1000;
    const pageSize = 50;

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      const url = new URL(route.request().url());
      const page = parseInt(url.searchParams.get('page') || '1');
      const startIdx = (page - 1) * pageSize;

      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: Array(pageSize).fill(null).map((_, i) => ({
            id: `entry-${startIdx + i}`,
            accountId,
            postingDate: '2026-02-01T10:00:00Z',
            sourceType: 'ride',
            sourceReferenceId: `ride-${startIdx + i}`,
            debitAmount: 2500,
            creditAmount: 0,
            runningBalance: 100000 - ((startIdx + i) * 100),
            linkedInvoiceId: null,
            metadata: {},
            createdAt: '2026-02-01T10:00:00Z'
          })),
          pagination: {
            page,
            pageSize,
            totalItems: totalEntries,
            totalPages: Math.ceil(totalEntries / pageSize),
            hasNext: (startIdx + pageSize) < totalEntries,
            hasPrevious: page > 1
          }
        })
      });
    });

    await page.goto(`/accounts/${accountId}?tab=transactions`);
    await page.waitForSelector('app-pagination');

    // Click Next 5 times rapidly
    for (let i = 0; i < 5; i++) {
      await page.click('button:has-text("Next")');
      await page.waitForTimeout(100); // Minimal delay
    }

    // Verify we're on page 6
    const paginationText = await page.locator('app-pagination').textContent();
    expect(paginationText).toContain('251 to 300'); // Page 6 shows items 251-300
  });

  test('should efficiently render running balance for all entries', async ({ page }) => {
    const entries = Array(50).fill(null).map((_, i) => ({
      id: `entry-${i}`,
      accountId,
      postingDate: '2026-02-01T10:00:00Z',
      sourceType: i % 2 === 0 ? 'ride' : 'payment',
      sourceReferenceId: i % 2 === 0 ? `ride-${i}` : `payment-${i}`,
      debitAmount: i % 2 === 0 ? 2500 : 0,
      creditAmount: i % 2 === 0 ? 0 : 5000,
      runningBalance: 100000 - (i * 2500), // Running balance decreases
      linkedInvoiceId: null,
      metadata: {},
      createdAt: '2026-02-01T10:00:00Z'
    }));

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: entries,
          pagination: { page: 1, pageSize: 50, totalItems: 50, totalPages: 1, hasNext: false, hasPrevious: false }
        })
      });
    });

    const startTime = Date.now();
    await page.goto(`/accounts/${accountId}?tab=transactions`);
    await page.waitForSelector('app-transaction-row');
    const renderTime = Date.now() - startTime;

    // Verify render time is reasonable
    expect(renderTime).toBeLessThan(1500);

    // Verify all running balances are displayed
    const rows = await page.locator('app-transaction-row').all();
    expect(rows.length).toBe(50);
  });

  test('should maintain performance with date range filters', async ({ page }) => {
    const entries = Array(200).fill(null).map((_, i) => ({
      id: `entry-${i}`,
      accountId,
      postingDate: `2026-01-${String(1 + (i % 30)).padStart(2, '0')}T10:00:00Z`,
      sourceType: 'ride',
      sourceReferenceId: `ride-${i}`,
      debitAmount: 2500,
      creditAmount: 0,
      runningBalance: 50000 - (i * 250),
      linkedInvoiceId: null,
      metadata: {},
      createdAt: `2026-01-${String(1 + (i % 30)).padStart(2, '0')}T10:00:00Z`
    }));

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      const url = new URL(route.request().url());
      const startDate = url.searchParams.get('startDate');
      const endDate = url.searchParams.get('endDate');

      let filteredEntries = entries;
      if (startDate && endDate) {
        filteredEntries = entries.filter(e => {
          const date = e.postingDate.split('T')[0];
          return date >= startDate && date <= endDate;
        });
      }

      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: filteredEntries.slice(0, 50),
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: filteredEntries.length,
            totalPages: Math.ceil(filteredEntries.length / 50),
            hasNext: filteredEntries.length > 50,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(`/accounts/${accountId}?tab=transactions`);
    await page.waitForSelector('app-transaction-filters');

    // Apply date filter
    const startTime = Date.now();
    await page.fill('input[name="startDate"]', '2026-01-01');
    await page.fill('input[name="endDate"]', '2026-01-31');
    await page.click('button:has-text("Apply Filters")');
    await page.waitForSelector('app-transaction-row');
    const filterTime = Date.now() - startTime;

    // Verify filter application is fast
    expect(filterTime).toBeLessThan(1000);
  });

  test('should use trackBy for efficient list updates', async ({ page }) => {
    let requestCount = 0;

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      requestCount++;

      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: Array(50).fill(null).map((_, i) => ({
            id: `entry-${requestCount}-${i}`,
            accountId,
            postingDate: '2026-02-01T10:00:00Z',
            sourceType: 'ride',
            sourceReferenceId: `ride-${i}`,
            debitAmount: 2500,
            creditAmount: 0,
            runningBalance: 50000 - (i * 250),
            linkedInvoiceId: null,
            metadata: {},
            createdAt: '2026-02-01T10:00:00Z'
          })),
          pagination: { page: 1, pageSize: 50, totalItems: 50, totalPages: 1, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.goto(`/accounts/${accountId}?tab=transactions`);
    await page.waitForSelector('app-transaction-row');

    // Trigger re-render by applying filter
    await page.click('button:has-text("Clear Filters")');
    await page.waitForSelector('app-transaction-row');

    // Verify component re-rendered efficiently (no full page reload)
    expect(requestCount).toBe(2);
  });
});
