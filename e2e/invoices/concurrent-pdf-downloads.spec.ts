import { test, expect } from '@playwright/test';

test.describe('Concurrent PDF Downloads', () => {
  const accountId = '123e4567-e89b-12d3-a456-426614174000';
  const baseUrl = `http://localhost:4200/accounts/${accountId}`;

  const mockInvoices = [
    {
      id: 'invoice-001',
      invoiceNumber: 'INV-2026-001',
      issuedAt: '2026-02-01T00:00:00Z'
    },
    {
      id: 'invoice-002',
      invoiceNumber: 'INV-2026-002',
      issuedAt: '2026-02-02T00:00:00Z'
    },
    {
      id: 'invoice-003',
      invoiceNumber: 'INV-2026-003',
      issuedAt: '2026-02-03T00:00:00Z'
    }
  ];

  test('should handle downloading multiple PDFs sequentially', async ({ page }) => {
    // Setup routes for all invoices
    for (const mockInv of mockInvoices) {
      await page.route(`**/api/tenants/*/accounts/*/invoices/${mockInv.id}`, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              id: mockInv.id,
              accountId: accountId,
              invoiceNumber: mockInv.invoiceNumber,
              billingPeriodStart: '2026-01-01',
              billingPeriodEnd: '2026-01-31',
              frequency: 'Monthly',
              subtotalCents: 250000,
              taxCents: 22500,
              totalCents: 272500,
              status: 'Issued',
              dueDate: '2026-02-15',
              issuedAt: mockInv.issuedAt,
              createdAt: mockInv.issuedAt,
              lineItems: []
            }
          })
        });
      });

      await page.route(`**/api/tenants/*/accounts/*/invoices/${mockInv.id}/pdf`, async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/pdf',
          headers: {
            'Content-Disposition': `attachment; filename="${mockInv.invoiceNumber}_${mockInv.issuedAt.split('T')[0]}.pdf"`
          },
          body: Buffer.from(`%PDF-1.4 ${mockInv.invoiceNumber}`)
        });
      });
    }

    // Download each PDF sequentially
    for (const mockInv of mockInvoices) {
      await page.goto(`${baseUrl}/invoices/${mockInv.id}`);
      
      const downloadPromise = page.waitForEvent('download');
      await page.locator('[data-testid="download-pdf-button"]').click();
      
      const download = await downloadPromise;
      expect(download.suggestedFilename()).toContain(mockInv.invoiceNumber);
    }
  });

  test('should not block UI when downloading PDF', async ({ page }) => {
    const invoiceId = 'invoice-001';
    
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
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
          }
        })
      });
    });

    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/pdf`, async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate slow PDF generation
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: Buffer.from('%PDF-1.4 mock')
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    const downloadButton = page.locator('[data-testid="download-pdf-button"]');
    await downloadButton.click();
    
    // Verify user can still interact with page
    const backButton = page.locator('button:has-text("Back")');
    await expect(backButton).toBeEnabled();
    
    // Verify other page elements remain accessible
    const invoiceNumber = page.locator('[data-testid="invoice-number"]');
    await expect(invoiceNumber).toBeVisible();
  });

  test('should allow retry after failed download', async ({ page }) => {
    const invoiceId = 'invoice-001';
    let attemptCount = 0;
    
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
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
          }
        })
      });
    });

    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/pdf`, async (route) => {
      attemptCount++;
      if (attemptCount === 1) {
        // First attempt fails
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'PDF generation failed' })
        });
      } else {
        // Retry succeeds
        await route.fulfill({
          status: 200,
          contentType: 'application/pdf',
          body: Buffer.from('%PDF-1.4 mock')
        });
      }
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    const downloadButton = page.locator('[data-testid="download-pdf-button"]');
    
    // First attempt
    await downloadButton.click();
    await page.waitForLoadState('networkidle');
    
    // Verify error displayed
    const errorMessage = page.locator('[data-testid="pdf-error-message"]');
    await expect(errorMessage).toBeVisible();
    
    // Retry
    const downloadPromise = page.waitForEvent('download');
    await downloadButton.click();
    
    const download = await downloadPromise;
    expect(download).toBeTruthy();
  });

  test('should handle rapid successive download clicks', async ({ page }) => {
    const invoiceId = 'invoice-001';
    let downloadRequestCount = 0;
    
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
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
          }
        })
      });
    });

    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/pdf`, async (route) => {
      downloadRequestCount++;
      await new Promise(resolve => setTimeout(resolve, 500));
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: Buffer.from('%PDF-1.4 mock')
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    const downloadButton = page.locator('[data-testid="download-pdf-button"]');
    
    // Click rapidly 3 times
    await downloadButton.click();
    await downloadButton.click();
    await downloadButton.click();
    
    await page.waitForTimeout(2000); // Wait for all requests to complete
    
    // Should only send one request (button disabled during download)
    expect(downloadRequestCount).toBeLessThanOrEqual(1);
  });
});
