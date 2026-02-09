import { test, expect } from '@playwright/test';

/**
 * E2E tests for account detail tabs navigation
 * User Story 1: Account Selection and Navigation
 */

test.describe('Account Detail Tabs Navigation', () => {
  const mockAccount = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    tenantId: '123e4567-e89b-12d3-a456-426614174000',
    name: 'General Hospital',
    type: 'organization',
    currentBalance: 125050,
    lastInvoiceDate: '2026-01-15',
    status: 'active',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z'
  };

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
    });

    await page.route('**/api/tenants/*/accounts/*', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({ data: mockAccount })
      });
    });
  });

  test('should display Summary tab content by default', async ({ page }) => {
    await page.goto('/accounts/123e4567-e89b-12d3-a456-426614174001');
    
    // Summary tab should be active
    const summaryTab = page.locator('button:has-text("Summary")');
    await expect(summaryTab).toHaveAttribute('aria-selected', 'true');
    
    // Should show account summary information
    await expect(page.locator('text=General Hospital')).toBeVisible();
    await expect(page.locator('text=/\\$1,250\\.50/')).toBeVisible();
    await expect(page.locator('text=/organization/i')).toBeVisible();
  });

  test('should load Transactions tab when clicked', async ({ page }) => {
    // Mock transactions endpoint
    await page.route('**/api/tenants/*/accounts/*/ledger-entries*', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            {
              id: 'ledger-1',
              accountId: '123e4567-e89b-12d3-a456-426614174001',
              postingDate: '2026-02-05T10:00:00Z',
              sourceType: 'ride',
              sourceReferenceId: 'ride-123',
              debitAmount: 5000,
              creditAmount: 0,
              runningBalance: 125050,
              linkedInvoiceId: null,
              metadata: {},
              createdAt: '2026-02-05T10:00:00Z'
            }
          ],
          pagination: { page: 1, pageSize: 50, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.goto('/accounts/123e4567-e89b-12d3-a456-426614174001');
    await page.click('button:has-text("Transactions")');
    
    // Transactions tab should be active
    await expect(page.locator('button:has-text("Transactions")')).toHaveAttribute('aria-selected', 'true');
    
    // Should show transactions list
    await expect(page.locator('text=ride-123')).toBeVisible();
  });

  test('should load Invoices tab when clicked', async ({ page }) => {
    // Mock invoices endpoint
    await page.route('**/api/tenants/*/accounts/*/invoices*', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [
            {
              id: 'invoice-1',
              accountId: '123e4567-e89b-12d3-a456-426614174001',
              invoiceNumber: 'INV-2026-001',
              billingPeriodStart: '2026-01-01',
              billingPeriodEnd: '2026-01-31',
              frequency: 'monthly',
              lineItems: [],
              subtotal: 500000,
              paymentsApplied: 0,
              outstandingAmount: 500000,
              status: 'issued',
              notes: null,
              internalReference: null,
              billingContactName: null,
              billingContactEmail: null,
              generatedBy: 'system',
              createdAt: '2026-02-01T00:00:00Z',
              lastMetadataUpdate: null
            }
          ],
          pagination: { page: 1, pageSize: 50, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.goto('/accounts/123e4567-e89b-12d3-a456-426614174001');
    await page.click('button:has-text("Invoices")');
    
    // Invoices tab should be active
    await expect(page.locator('button:has-text("Invoices")')).toHaveAttribute('aria-selected', 'true');
    
    // Should show invoices list
    await expect(page.locator('text=INV-2026-001')).toBeVisible();
  });

  test('should maintain tab selection when refreshing page', async ({ page }) => {
    await page.goto('/accounts/123e4567-e89b-12d3-a456-426614174001?tab=transactions');
    
    // Transactions tab should be pre-selected
    await expect(page.locator('button:has-text("Transactions")')).toHaveAttribute('aria-selected', 'true');
  });

  test('should handle deep linking to specific tabs', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/*/invoices*', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        })
      });
    });

    // Direct link to Invoices tab
    await page.goto('/accounts/123e4567-e89b-12d3-a456-426614174001?tab=invoices');
    
    // Invoices tab should be selected
    await expect(page.locator('button:has-text("Invoices")')).toHaveAttribute('aria-selected', 'true');
  });

  test('should update URL when switching tabs', async ({ page }) => {
    await page.goto('/accounts/123e4567-e89b-12d3-a456-426614174001');
    
    // Click Transactions tab
    await page.click('button:has-text("Transactions")');
    await expect(page).toHaveURL(/tab=transactions/);
    
    // Click Invoices tab
    await page.click('button:has-text("Invoices")');
    await expect(page).toHaveURL(/tab=invoices/);
    
    // Click Summary tab
    await page.click('button:has-text("Summary")');
    // Summary might not have tab param or tab=summary
    const url = page.url();
    expect(url.includes('tab=summary') || !url.includes('tab=')).toBeTruthy();
  });
});
