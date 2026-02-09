import { test, expect } from '@playwright/test';

/**
 * E2E Tests: Transaction Detail View (User Story 2)
 * Tests individual ledger entry detail display with cross-reference links
 */

test.describe('Transaction Detail View', () => {
  const accountId = '123e4567-e89b-12d3-a456-426614174001';
  const tenantId = '123e4567-e89b-12d3-a456-426614174000';
  const ledgerEntryId = 'entry-123';

  test.beforeEach(async ({ page }) => {
    await page.route('**/api/auth/session', route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ tenantId, userId: 'user-123' })
      });
    });
  });

  test('should display full ledger entry details', async ({ page }) => {
    const mockLedgerEntry = {
      id: ledgerEntryId,
      accountId,
      postingDate: '2026-02-05T10:30:45Z',
      sourceType: 'ride',
      sourceReferenceId: 'ride-789',
      debitAmount: 3750,
      creditAmount: 0,
      runningBalance: 3750,
      linkedInvoiceId: 'invoice-456',
      metadata: {
        rideDistance: 12.5,
        rideOrigin: 'Downtown',
        rideDestination: 'Airport'
      },
      createdAt: '2026-02-05T10:30:45Z'
    };

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger/${ledgerEntryId}`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: mockLedgerEntry })
      });
    });

    await page.goto(`/accounts/${accountId}/transactions/${ledgerEntryId}`);
    await page.waitForSelector('app-transaction-detail');

    // Verify all fields are displayed
    const content = await page.locator('app-transaction-detail').textContent();
    expect(content).toContain('entry-123');
    expect(content).toContain('Feb 5, 2026');
    expect(content).toContain('Ride');
    expect(content).toContain('ride-789');
    expect(content).toContain('$37.50'); // Debit amount
    expect(content).toContain('$37.50'); // Running balance
  });

  test('should display cross-reference link to linked invoice', async ({ page }) => {
    const mockLedgerEntry = {
      id: ledgerEntryId,
      accountId,
      postingDate: '2026-02-05T10:30:00Z',
      sourceType: 'ride',
      sourceReferenceId: 'ride-789',
      debitAmount: 2500,
      creditAmount: 0,
      runningBalance: 2500,
      linkedInvoiceId: 'invoice-456',
      metadata: {},
      createdAt: '2026-02-05T10:30:00Z'
    };

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger/${ledgerEntryId}`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: mockLedgerEntry })
      });
    });

    await page.goto(`/accounts/${accountId}/transactions/${ledgerEntryId}`);
    await page.waitForSelector('a[href*="/invoices/invoice-456"]');

    const invoiceLink = page.locator('a[href*="/invoices/invoice-456"]');
    expect(await invoiceLink.isVisible()).toBeTruthy();
    expect(await invoiceLink.textContent()).toContain('invoice-456');
  });

  test('should NOT display invoice link when linkedInvoiceId is null', async ({ page }) => {
    const mockLedgerEntry = {
      id: ledgerEntryId,
      accountId,
      postingDate: '2026-02-05T10:30:00Z',
      sourceType: 'payment',
      sourceReferenceId: 'payment-999',
      debitAmount: 0,
      creditAmount: 5000,
      runningBalance: -2500,
      linkedInvoiceId: null,
      metadata: {},
      createdAt: '2026-02-05T10:30:00Z'
    };

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger/${ledgerEntryId}`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: mockLedgerEntry })
      });
    });

    await page.goto(`/accounts/${accountId}/transactions/${ledgerEntryId}`);
    await page.waitForSelector('app-transaction-detail');

    const invoiceLink = page.locator('a[href*="/invoices/"]');
    expect(await invoiceLink.count()).toBe(0);
  });

  test('should display metadata fields', async ({ page }) => {
    const mockLedgerEntry = {
      id: ledgerEntryId,
      accountId,
      postingDate: '2026-02-05T10:30:00Z',
      sourceType: 'ride',
      sourceReferenceId: 'ride-789',
      debitAmount: 3750,
      creditAmount: 0,
      runningBalance: 3750,
      linkedInvoiceId: null,
      metadata: {
        rideDistance: 12.5,
        rideOrigin: 'Downtown',
        rideDestination: 'Airport',
        vehicleType: 'Sedan'
      },
      createdAt: '2026-02-05T10:30:00Z'
    };

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger/${ledgerEntryId}`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: mockLedgerEntry })
      });
    });

    await page.goto(`/accounts/${accountId}/transactions/${ledgerEntryId}`);
    await page.waitForSelector('app-transaction-detail');

    const content = await page.locator('app-transaction-detail').textContent();
    expect(content).toContain('12.5');
    expect(content).toContain('Downtown');
    expect(content).toContain('Airport');
    expect(content).toContain('Sedan');
  });

  test('should handle 404 for non-existent ledger entry', async ({ page }) => {
    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger/non-existent`, route => {
      route.fulfill({
        status: 404,
        body: JSON.stringify({ error: 'Ledger entry not found' })
      });
    });

    await page.goto(`/accounts/${accountId}/transactions/non-existent`);
    await page.waitForSelector('app-error-state');

    const errorText = await page.locator('app-error-state').textContent();
    expect(errorText).toContain('Transaction not found');
  });

  test('should display back button to return to ledger list', async ({ page }) => {
    const mockLedgerEntry = {
      id: ledgerEntryId,
      accountId,
      postingDate: '2026-02-05T10:30:00Z',
      sourceType: 'ride',
      sourceReferenceId: 'ride-789',
      debitAmount: 2500,
      creditAmount: 0,
      runningBalance: 2500,
      linkedInvoiceId: null,
      metadata: {},
      createdAt: '2026-02-05T10:30:00Z'
    };

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger/${ledgerEntryId}`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: mockLedgerEntry })
      });
    });

    await page.goto(`/accounts/${accountId}/transactions/${ledgerEntryId}`);
    await page.waitForSelector('button:has-text("Back to Transactions")');

    const backButton = page.locator('button:has-text("Back to Transactions")');
    expect(await backButton.isVisible()).toBeTruthy();
  });

  test('should navigate back to transactions list via back button', async ({ page }) => {
    const mockLedgerEntry = {
      id: ledgerEntryId,
      accountId,
      postingDate: '2026-02-05T10:30:00Z',
      sourceType: 'ride',
      sourceReferenceId: 'ride-789',
      debitAmount: 2500,
      creditAmount: 0,
      runningBalance: 2500,
      linkedInvoiceId: null,
      metadata: {},
      createdAt: '2026-02-05T10:30:00Z'
    };

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger**`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [mockLedgerEntry],
          pagination: { page: 1, pageSize: 50, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger/${ledgerEntryId}`, route => {
      route.fulfill({
        status: 200,
        body: JSON.stringify({ data: mockLedgerEntry })
      });
    });

    await page.goto(`/accounts/${accountId}/transactions/${ledgerEntryId}`);
    await page.waitForSelector('button:has-text("Back to Transactions")');
    await page.click('button:has-text("Back to Transactions")');

    expect(page.url()).toContain(`/accounts/${accountId}?tab=transactions`);
  });

  test('should display loading state while fetching detail', async ({ page }) => {
    await page.route(`**/api/tenants/${tenantId}/accounts/${accountId}/ledger/${ledgerEntryId}`, async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: {
            id: ledgerEntryId,
            accountId,
            postingDate: '2026-02-05T10:30:00Z',
            sourceType: 'ride',
            sourceReferenceId: 'ride-789',
            debitAmount: 2500,
            creditAmount: 0,
            runningBalance: 2500,
            linkedInvoiceId: null,
            metadata: {},
            createdAt: '2026-02-05T10:30:00Z'
          }
        })
      });
    });

    await page.goto(`/accounts/${accountId}/transactions/${ledgerEntryId}`);
    await page.waitForSelector('app-loading-spinner');

    expect(await page.locator('app-loading-spinner').isVisible()).toBeTruthy();
  });
});
