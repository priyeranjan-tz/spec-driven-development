import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Transaction Filters (User Story 2)
 * Tests date range and source type filtering functionality
 */

test.describe('Transaction Filters', () => {
  const accountId = '123e4567-e89b-12d3-a456-426614174001';
  const tenantId = '123e4567-e89b-12d3-a456-426614174000';

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ tenantId, userId: 'user-123' })
      });
    });

    await page.goto(`/accounts/${accountId}?tab=transactions`);
  });

  test('should display filter controls (date range, source type)', async ({ page }) => {
    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.waitForSelector('app-transaction-filters');
    expect(await page.locator('input[type="date"][name="startDate"]').isVisible()).toBeTruthy();
    expect(await page.locator('input[type="date"][name="endDate"]').isVisible()).toBeTruthy();
    expect(await page.locator('select[name="sourceType"]').isVisible()).toBeTruthy();
  });

  test('should filter by date range', async ({ page }) => {
    let capturedQuery: URLSearchParams | null = null;

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      const url = new URL(route.request().url());
      capturedQuery = url.searchParams;

      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.waitForSelector('app-transaction-filters');

    // Set date range
    await page.fill('input[name="startDate"]', '2026-01-01');
    await page.fill('input[name="endDate"]', '2026-01-31');
    await page.click('button:has-text("Apply Filters")');

    await page.waitForTimeout(500);
    expect(capturedQuery?.get('startDate')).toBe('2026-01-01');
    expect(capturedQuery?.get('endDate')).toBe('2026-01-31');
  });

  test('should filter by source type (Ride)', async ({ page }) => {
    let capturedQuery: URLSearchParams | null = null;

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      const url = new URL(route.request().url());
      capturedQuery = url.searchParams;

      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.waitForSelector('app-transaction-filters');
    await page.selectOption('select[name="sourceType"]', 'ride');
    await page.click('button:has-text("Apply Filters")');

    await page.waitForTimeout(500);
    expect(capturedQuery?.get('sourceType')).toBe('ride');
  });

  test('should filter by source type (Payment)', async ({ page }) => {
    let capturedQuery: URLSearchParams | null = null;

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      const url = new URL(route.request().url());
      capturedQuery = url.searchParams;

      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.waitForSelector('app-transaction-filters');
    await page.selectOption('select[name="sourceType"]', 'payment');
    await page.click('button:has-text("Apply Filters")');

    await page.waitForTimeout(500);
    expect(capturedQuery?.get('sourceType')).toBe('payment');
  });

  test('should combine multiple filters', async ({ page }) => {
    let capturedQuery: URLSearchParams | null = null;

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      const url = new URL(route.request().url());
      capturedQuery = url.searchParams;

      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.waitForSelector('app-transaction-filters');

    // Apply all filters
    await page.fill('input[name="startDate"]', '2026-02-01');
    await page.fill('input[name="endDate"]', '2026-02-06');
    await page.selectOption('select[name="sourceType"]', 'ride');
    await page.click('button:has-text("Apply Filters")');

    await page.waitForTimeout(500);
    expect(capturedQuery?.get('startDate')).toBe('2026-02-01');
    expect(capturedQuery?.get('endDate')).toBe('2026-02-06');
    expect(capturedQuery?.get('sourceType')).toBe('ride');
  });

  test('should clear all filters', async ({ page }) => {
    let requestCount = 0;
    let lastQuery: URLSearchParams | null = null;

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      requestCount++;
      const url = new URL(route.request().url());
      lastQuery = url.searchParams;

      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.waitForSelector('app-transaction-filters');

    // Apply filters
    await page.fill('input[name="startDate"]', '2026-01-01');
    await page.selectOption('select[name="sourceType"]', 'ride');
    await page.click('button:has-text("Apply Filters")');
    await page.waitForTimeout(300);

    // Clear filters
    await page.click('button:has-text("Clear Filters")');
    await page.waitForTimeout(300);

    expect(lastQuery?.get('startDate')).toBeNull();
    expect(lastQuery?.get('sourceType')).toBeNull();
  });

  test('should reset to page 1 when filters change', async ({ page }) => {
    let currentPage = 2;

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      const url = new URL(route.request().url());
      currentPage = parseInt(url.searchParams.get('page') || '1');

      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: { page: currentPage, pageSize: 50, totalItems: 100, totalPages: 2, hasNext: false, hasPrevious: true }
        })
      });
    });

    await page.waitForSelector('app-pagination');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(300);
    expect(currentPage).toBe(2);

    // Apply filter - should reset to page 1
    await page.selectOption('select[name="sourceType"]', 'ride');
    await page.click('button:has-text("Apply Filters")');
    await page.waitForTimeout(300);
    expect(currentPage).toBe(1);
  });

  test('should validate date range (end date after start date)', async ({ page }) => {
    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.waitForSelector('app-transaction-filters');

    // Try invalid range (end before start)
    await page.fill('input[name="startDate"]', '2026-02-06');
    await page.fill('input[name="endDate"]', '2026-01-01');
    await page.click('button:has-text("Apply Filters")');

    // Check for validation error
    const errorMessage = page.locator('text=/End date must be after start date/i');
    expect(await errorMessage.isVisible()).toBeTruthy();
  });
});
