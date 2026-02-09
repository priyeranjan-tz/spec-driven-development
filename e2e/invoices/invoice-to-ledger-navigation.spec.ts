import { test, expect } from '@playwright/test';

test.describe('Invoice to Ledger Navigation', () => {
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
    lineItems: []
  };

  const mockLedgerEntries = [
    {
      id: 'ledger-001',
      accountId: accountId,
      postingDate: '2026-02-01T00:00:00Z',
      sourceType: 'Payment',
      sourceReferenceId: 'payment-123',
      debitAmount: 0,
      creditAmount: 272500,
      runningBalance: -272500,
      linkedInvoiceId: invoiceId,
      metadata: {},
      createdAt: '2026-02-01T00:00:00Z'
    }
  ];

  test('should display link to view related ledger entries', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    // Verify ledger link exists
    const ledgerLink = page.locator('[data-testid="view-ledger-entries-link"]');
    await expect(ledgerLink).toBeVisible();
    await expect(ledgerLink).toContainText('View Related Ledger Entries');
  });

  test('should navigate to transactions tab with invoice filter', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    await page.route('**/api/tenants/*/accounts/*/ledger*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockLedgerEntries,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 1,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    // Click ledger link
    await page.locator('[data-testid="view-ledger-entries-link"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify navigation to transactions tab
    expect(page.url()).toContain('tab=transactions');
    
    // Verify invoice filter is applied
    expect(page.url()).toContain(`invoiceId=${invoiceId}`);
  });

  test('should display filtered ledger entries for the invoice', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    await page.route('**/api/tenants/*/accounts/*/ledger*', async (route) => {
      const url = new URL(route.request().url());
      
      // Verify linkedInvoiceId filter is applied
      if (url.searchParams.get('linkedInvoiceId') === invoiceId) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: mockLedgerEntries,
            pagination: {
              page: 1,
              pageSize: 50,
              totalItems: 1,
              totalPages: 1,
              hasNext: false,
              hasPrevious: false
            }
          })
        });
      } else {
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

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    // Click ledger link
    await page.locator('[data-testid="view-ledger-entries-link"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify ledger entries are displayed
    const ledgerRows = page.locator('[data-testid="transaction-row"]');
    await expect(ledgerRows).toHaveCount(1);
    
    // Verify correct entry is displayed
    await expect(ledgerRows.first()).toContainText('payment-123');
  });

  test('should display breadcrumb showing current context', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    await page.route('**/api/tenants/*/accounts/*/ledger*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: mockLedgerEntries,
          pagination: {
            page: 1,
            pageSize: 50,
            totalItems: 1,
            totalPages: 1,
            hasNext: false,
            hasPrevious: false
          }
        })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    // Click ledger link
    await page.locator('[data-testid="view-ledger-entries-link"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify breadcrumb or filter indicator
    const filterIndicator = page.locator('[data-testid="invoice-filter-indicator"]');
    await expect(filterIndicator).toBeVisible();
    await expect(filterIndicator).toContainText('INV-2026-001');
  });
});
