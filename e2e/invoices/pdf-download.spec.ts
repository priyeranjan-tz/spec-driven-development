import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Invoice PDF Download', () => {
  const accountId = '123e4567-e89b-12d3-a456-426614174000';
  const invoiceId = '123e4567-e89b-12d3-a456-426614174001';
  const baseUrl = `http://localhost:4200/accounts/${accountId}`;

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

  test.beforeEach(async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });
  });

  test('should display PDF download button on invoice detail page', async ({ page }) => {
    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    const downloadButton = page.locator('[data-testid="download-pdf-button"]');
    await expect(downloadButton).toBeVisible();
    await expect(downloadButton).toContainText('Download PDF');
  });

  test('should trigger PDF download when button clicked', async ({ page }) => {
    const mockPdfBlob = Buffer.from('%PDF-1.4 mock pdf content');
    
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/pdf`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: mockPdfBlob
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    // Set up download listener
    const downloadPromise = page.waitForEvent('download');
    
    await page.locator('[data-testid="download-pdf-button"]').click();
    
    const download = await downloadPromise;
    expect(download).toBeTruthy();
  });

  test('should download PDF with correct filename', async ({ page }) => {
    const mockPdfBlob = Buffer.from('%PDF-1.4 mock pdf content');
    
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/pdf`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        headers: {
          'Content-Disposition': 'attachment; filename="INV-2026-001_2026-02-01.pdf"'
        },
        body: mockPdfBlob
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    const downloadPromise = page.waitForEvent('download');
    await page.locator('[data-testid="download-pdf-button"]').click();
    
    const download = await downloadPromise;
    const suggestedFilename = download.suggestedFilename();
    
    expect(suggestedFilename).toMatch(/INV-2026-001.*\.pdf/);
  });

  test('should show loading state during PDF generation', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/pdf`, async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/pdf',
        body: Buffer.from('%PDF-1.4 mock')
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    const downloadButton = page.locator('[data-testid="download-pdf-button"]');
    await downloadButton.click();
    
    // Verify loading state
    await expect(downloadButton).toBeDisabled();
    await expect(downloadButton).toContainText('Generating');
  });

  test('should handle PDF generation errors', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/pdf`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'PDF generation failed' })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    await page.locator('[data-testid="download-pdf-button"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify error message displayed
    const errorMessage = page.locator('[data-testid="pdf-error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Failed to generate PDF');
  });

  test('should re-enable download button after error', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/pdf`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'PDF generation failed' })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    const downloadButton = page.locator('[data-testid="download-pdf-button"]');
    await downloadButton.click();
    await page.waitForLoadState('networkidle');
    
    // Verify button re-enabled after error
    await expect(downloadButton).toBeEnabled();
  });

  test('should handle 404 error for non-existent invoice', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/pdf`, async (route) => {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Invoice not found' })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    await page.locator('[data-testid="download-pdf-button"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify error message
    const errorMessage = page.locator('[data-testid="pdf-error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invoice not found');
  });
});
