import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Transaction Ledger List View (User Story 2)
 * Tests ledger entry list with empty, loading, success, error states and pagination
 */

test.describe('Transaction Ledger Review - List View', () => {
  const accountId = '123e4567-e89b-12d3-a456-426614174001';
  const tenantId = '123e4567-e89b-12d3-a456-426614174000';

  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ tenantId, userId: 'user-123' })
      });
    });

    // Navigate to account detail, then Transactions tab
    await page.goto(`/accounts/${accountId}?tab=transactions`);
  });

  test('should display loading spinner while fetching ledger entries', async ({ page }) => {
    // Mock delayed API response
    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.waitForSelector('app-loading-spinner');
    expect(await page.locator('app-loading-spinner').isVisible()).toBeTruthy();
  });

  test('should display empty state when no transactions exist', async ({ page }) => {
    // Mock empty response
    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.waitForSelector('app-empty-state');
    const emptyText = await page.locator('app-empty-state').textContent();
    expect(emptyText).toContain('No transactions found');
  });

  test('should display ledger entries with running balance', async ({ page }) => {
    const mockLedgerEntries = [
      {
        id: 'entry-001',
        accountId,
        postingDate: '2026-02-05T10:30:00Z',
        sourceType: 'ride',
        sourceReferenceId: 'ride-123',
        debitAmount: 2500,
        creditAmount: 0,
        runningBalance: 2500,
        linkedInvoiceId: null,
        metadata: {},
        createdAt: '2026-02-05T10:30:00Z'
      },
      {
        id: 'entry-002',
        accountId,
        postingDate: '2026-02-04T14:15:00Z',
        sourceType: 'payment',
        sourceReferenceId: 'payment-456',
        debitAmount: 0,
        creditAmount: 5000,
        runningBalance: -2500,
        linkedInvoiceId: 'invoice-789',
        metadata: {},
        createdAt: '2026-02-04T14:15:00Z'
      }
    ];

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: mockLedgerEntries,
          pagination: { page: 1, pageSize: 50, totalItems: 2, totalPages: 1, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.waitForSelector('app-transaction-row');

    // Check first entry (Ride charge - debit)
    const firstRow = page.locator('app-transaction-row').first();
    expect(await firstRow.textContent()).toContain('Feb 5, 2026');
    expect(await firstRow.textContent()).toContain('Ride');
    expect(await firstRow.textContent()).toContain('$25.00'); // Debit amount
    expect(await firstRow.textContent()).toContain('$25.00'); // Running balance

    // Check second entry (Payment - credit)
    const secondRow = page.locator('app-transaction-row').nth(1);
    expect(await secondRow.textContent()).toContain('Feb 4, 2026');
    expect(await secondRow.textContent()).toContain('Payment');
    expect(await secondRow.textContent()).toContain('$50.00'); // Credit amount
    expect(await secondRow.textContent()).toContain('-$25.00'); // Negative running balance
  });

  test('should display error state on API failure', async ({ page }) => {
    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.waitForSelector('app-error-state');
    const errorText = await page.locator('app-error-state').textContent();
    expect(errorText).toContain('Failed to load transactions');
  });

  test('should handle retry button on error', async ({ page }) => {
    let requestCount = 0;

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      requestCount++;
      if (requestCount === 1) {
        route.fulfill({ status: 500, body: JSON.stringify({ error: 'Server Error' }) });
      } else {
        route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: [],
            pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
          })
        });
      }
    });

    await page.waitForSelector('app-error-state');
    await page.click('button:has-text("Retry")');
    await page.waitForSelector('app-empty-state');
    expect(requestCount).toBe(2);
  });

  test('should display pagination controls for multiple pages', async ({ page }) => {
    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      const url = new URL(route.request().url());
      const page = parseInt(url.searchParams.get('page') || '1');

      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: Array(50).fill(null).map((_, i) => ({
            id: `entry-${page}-${i}`,
            accountId,
            postingDate: '2026-02-01T10:00:00Z',
            sourceType: 'ride',
            sourceReferenceId: `ride-${i}`,
            debitAmount: 1000,
            creditAmount: 0,
            runningBalance: 1000 * (i + 1),
            linkedInvoiceId: null,
            metadata: {},
            createdAt: '2026-02-01T10:00:00Z'
          })),
          pagination: { page, pageSize: 50, totalItems: 150, totalPages: 3, hasNext: page < 3, hasPrevious: page > 1 }
        })
      });
    });

    await page.waitForSelector('app-pagination');
    expect(await page.locator('app-pagination').isVisible()).toBeTruthy();
    expect(await page.locator('app-pagination').textContent()).toContain('Showing 1 to 50 of 150');
  });

  test('should navigate to next page via pagination', async ({ page }) => {
    let currentPage = 1;

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      const url = new URL(route.request().url());
      currentPage = parseInt(url.searchParams.get('page') || '1');

      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: { page: currentPage, pageSize: 50, totalItems: 100, totalPages: 2, hasNext: currentPage < 2, hasPrevious: currentPage > 1 }
        })
      });
    });

    await page.waitForSelector('app-pagination');
    await page.click('button:has-text("Next")');
    await page.waitForTimeout(500);
    expect(currentPage).toBe(2);
  });
});
