import { test, expect } from '@playwright/test';

test.describe('Ledger to Invoice Navigation', () => {
  const accountId = '123e4567-e89b-12d3-a456-426614174000';
  const invoiceId = '123e4567-e89b-12d3-a456-426614174001';
  const ledgerEntryId = 'ledger-001';
  const baseUrl = `http://localhost:4200/accounts/${accountId}?tab=transactions`;

  const mockLedgerEntry = {
    id: ledgerEntryId,
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
  };

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

  test('should display invoice link when linkedInvoiceId present', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/ledger/${ledgerEntryId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockLedgerEntry })
      });
    });

    await page.goto(`${baseUrl}/transactions/${ledgerEntryId}`);
    
    // Verify invoice link is visible
    const invoiceLink = page.locator(`a[href*="/invoices/${invoiceId}"]`);
    await expect(invoiceLink).toBeVisible();
  });

  test('should navigate to invoice detail when link clicked', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/ledger/${ledgerEntryId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockLedgerEntry })
      });
    });

    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    await page.goto(`${baseUrl}/transactions/${ledgerEntryId}`);
    
    // Click invoice link
    const invoiceLink = page.locator(`a[href*="/invoices/${invoiceId}"]`);
    await invoiceLink.click();
    await page.waitForLoadState('networkidle');
    
    // Verify navigation to invoice detail
    expect(page.url()).toContain(`/invoices/${invoiceId}`);
    
    // Verify invoice details are displayed
    await expect(page.locator('[data-testid="invoice-number"]')).toContainText('INV-2026-001');
  });

  test('should NOT display invoice link when linkedInvoiceId is null', async ({ page }) => {
    const ledgerEntryWithoutInvoice = {
      ...mockLedgerEntry,
      linkedInvoiceId: null
    };

    await page.route(`**/api/tenants/*/accounts/*/ledger/${ledgerEntryId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: ledgerEntryWithoutInvoice })
      });
    });

    await page.goto(`${baseUrl}/transactions/${ledgerEntryId}`);
    
    // Verify no invoice link is present
    const invoiceLink = page.locator(`a[href*="/invoices/"]`);
    await expect(invoiceLink).not.toBeVisible();
    
    // Verify placeholder text is shown instead
    const linkedInvoiceField = page.locator('[data-testid="linked-invoice-field"]');
    await expect(linkedInvoiceField).toContainText('-');
  });

  test('should display invoice number in link text', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/ledger/${ledgerEntryId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockLedgerEntry })
      });
    });

    await page.goto(`${baseUrl}/transactions/${ledgerEntryId}`);
    
    // Verify invoice link displays invoice ID
    const invoiceLink = page.locator(`a[href*="/invoices/${invoiceId}"]`);
    await expect(invoiceLink).toContainText(invoiceId);
  });

  test('should navigate back to ledger from invoice detail', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/ledger/${ledgerEntryId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockLedgerEntry })
      });
    });

    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    // Start at ledger detail
    await page.goto(`${baseUrl}/transactions/${ledgerEntryId}`);
    
    // Click invoice link
    await page.locator(`a[href*="/invoices/${invoiceId}"]`).click();
    await page.waitForLoadState('networkidle');
    
    // Click back button or breadcrumb
    await page.locator('button:has-text("Back")').click();
    await page.waitForLoadState('networkidle');
    
    // Verify back at ledger detail or transactions tab
    expect(page.url()).toContain('tab=transactions');
  });
});
