import { test, expect } from '@playwright/test';

test.describe('Invoice PDF Filename Format', () => {
  const accountId = '123e4567-e89b-12d3-a456-426614174000';
  const baseUrl = `http://localhost:4200/accounts/${accountId}`;

  const testCases = [
    {
      invoiceId: 'invoice-001',
      invoiceNumber: 'INV-2026-001',
      issuedAt: '2026-02-01T00:00:00Z',
      expectedPattern: /INV-2026-001_2026-02-01\.pdf/
    },
    {
      invoiceId: 'invoice-002',
      invoiceNumber: 'INV-2026-042',
      issuedAt: '2026-02-15T10:30:00Z',
      expectedPattern: /INV-2026-042_2026-02-15\.pdf/
    },
    {
      invoiceId: 'invoice-003',
      invoiceNumber: 'INVOICE-2026-001',
      issuedAt: '2026-01-01T00:00:00Z',
      expectedPattern: /INVOICE-2026-001_2026-01-01\.pdf/
    }
  ];

  testCases.forEach(({ invoiceId, invoiceNumber, issuedAt, expectedPattern }) => {
    test(`should generate filename with invoice number ${invoiceNumber} and date`, async ({ page }) => {
      const mockInvoice = {
        id: invoiceId,
        accountId: accountId,
        invoiceNumber: invoiceNumber,
        billingPeriodStart: '2026-01-01',
        billingPeriodEnd: '2026-01-31',
        frequency: 'Monthly',
        subtotalCents: 250000,
        taxCents: 22500,
        totalCents: 272500,
        status: 'Issued',
        dueDate: '2026-02-15',
        issuedAt: issuedAt,
        createdAt: issuedAt,
        lineItems: []
      };

      await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: mockInvoice })
        });
      });

      await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/pdf`, async (route) => {
        const filename = `${invoiceNumber}_${issuedAt.split('T')[0]}.pdf`;
        await route.fulfill({
          status: 200,
          contentType: 'application/pdf',
          headers: {
            'Content-Disposition': `attachment; filename="${filename}"`
          },
          body: Buffer.from('%PDF-1.4 mock')
        });
      });

      await page.goto(`${baseUrl}/invoices/${invoiceId}`);
      
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="download-pdf-button"]').click();
      
      const download = await downloadPromise;
      const suggestedFilename = download.suggestedFilename();
      
      expect(suggestedFilename).toMatch(expectedPattern);
    });
  });

  test('should sanitize special characters in filename', async ({ page }) => {
    const invoiceId = 'special-invoice';
    const invoiceNumber = 'INV/2026\\001';
    const issuedAt = '2026-02-01T00:00:00Z';

    const mockInvoice = {
      id: invoiceId,
      accountId: accountId,
      invoiceNumber: invoiceNumber,
      billingPeriodStart: '2026-01-01',
      billingPeriodEnd: '2026-01-31',
      frequency: 'Monthly',
      subtotalCents: 250000,
      taxCents: 22500,
      totalCents: 272500,
      status: 'Issued',
      dueDate: '2026-02-15',
      issuedAt: issuedAt,
      createdAt: issuedAt,
      lineItems: []
    };

    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/pdf`, async (route) => {
      // Backend should sanitize special characters
      const sanitizedNumber = invoiceNumber.replace(/[/\\]/g, '-');
      const filename = `${sanitizedNumber}_${issuedAt.split('T')[0]}.pdf`;
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        headers: {
          'Content-Disposition': `attachment; filename="${filename}"`
        },
        body: Buffer.from('%PDF-1.4 mock')
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="download-pdf-button"]').click();
    
    const download = await downloadPromise;
    const suggestedFilename = download.suggestedFilename();
    
    // Verify special characters replaced with safe alternatives
    expect(suggestedFilename).not.toContain('/');
    expect(suggestedFilename).not.toContain('\\');
    expect(suggestedFilename).toMatch(/INV-2026-001_2026-02-01\.pdf/);
  });

  test('should use fallback filename if Content-Disposition missing', async ({ page }) => {
    const invoiceId = 'fallback-invoice';
    const invoiceNumber = 'INV-2026-999';

    const mockInvoice = {
      id: invoiceId,
      accountId: accountId,
      invoiceNumber: invoiceNumber,
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

    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/pdf`, async (route) => {
      // No Content-Disposition header
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: Buffer.from('%PDF-1.4 mock')
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="download-pdf-button"]').click();
    
    const download = await downloadPromise;
    const suggestedFilename = download.suggestedFilename();
    
    // Should have some filename (browser fallback or client-side generated)
    expect(suggestedFilename).toBeTruthy();
    expect(suggestedFilename.endsWith('.pdf')).toBe(true);
  });
});
