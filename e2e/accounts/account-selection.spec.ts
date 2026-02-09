import { test, expect } from '@playwright/test';

/**
 * E2E tests for account selection and navigation to detail view
 * User Story 1: Account Selection and Navigation
 */

test.describe('Account Selection and Navigation', () => {
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
    // Mock authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
    });

    // Mock accounts list
    await page.route('**/api/tenants/*/accounts*', async route => {
      if (route.request().url().includes('/accounts/')) {
        // Detail request
        await route.fulfill({
          status: 200,
          body: JSON.stringify({ data: mockAccount })
        });
      } else {
        // List request
        await route.fulfill({
          status: 200,
          body: JSON.stringify({
            data: [mockAccount],
            pagination: { page: 1, pageSize: 50, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false }
          })
        });
      }
    });
  });

  test('should navigate to account detail when clicking an account', async ({ page }) => {
    await page.goto('/accounts');
    
    // Wait for accounts to load
    await expect(page.locator('text=General Hospital')).toBeVisible();
    
    // Click on account
    await page.click('text=General Hospital');
    
    // Should navigate to detail page
    await expect(page).toHaveURL(/\/accounts\/123e4567-e89b-12d3-a456-426614174001/);
  });

  test('should display account detail with tabs', async ({ page }) => {
    await page.goto('/accounts/123e4567-e89b-12d3-a456-426614174001');
    
    // Should show account name
    await expect(page.locator('text=General Hospital')).toBeVisible();
    
    // Should show tabs
    await expect(page.locator('button:has-text("Summary")')).toBeVisible();
    await expect(page.locator('button:has-text("Transactions")')).toBeVisible();
    await expect(page.locator('button:has-text("Invoices")')).toBeVisible();
  });

  test('should switch between tabs', async ({ page }) => {
    await page.goto('/accounts/123e4567-e89b-12d3-a456-426614174001');
    
    // Default tab should be Summary
    await expect(page.locator('[aria-selected="true"]:has-text("Summary")')).toBeVisible();
    
    // Click Transactions tab
    await page.click('button:has-text("Transactions")');
    await expect(page.locator('[aria-selected="true"]:has-text("Transactions")')).toBeVisible();
    
    // Click Invoices tab
    await page.click('button:has-text("Invoices")');
    await expect(page.locator('[aria-selected="true"]:has-text("Invoices")')).toBeVisible();
    
    // Click back to Summary
    await page.click('button:has-text("Summary")');
    await expect(page.locator('[aria-selected="true"]:has-text("Summary")')).toBeVisible();
  });

  test('should retain scroll position when navigating back to list', async ({ page }) => {
    // Mock large list
    await page.route('**/api/tenants/*/accounts*', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: Array(50).fill(null).map((_, i) => ({
            id: `account-${i}`,
            tenantId: 'tenant-1',
            name: `Account ${i}`,
            type: 'organization',
            currentBalance: 100000,
            lastInvoiceDate: '2026-01-15',
            status: 'active',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2026-02-01T00:00:00Z'
          })),
          pagination: { page: 1, pageSize: 50, totalItems: 50, totalPages: 1, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.goto('/accounts');
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    const scrollPosition = await page.evaluate(() => window.scrollY);
    
    // Click an account
    await page.click('text=Account 10');
    await expect(page).toHaveURL(/\/accounts\/account-10/);
    
    // Navigate back
    await page.goBack();
    
    // Scroll position should be maintained (within reasonable tolerance)
    const newScrollPosition = await page.evaluate(() => window.scrollY);
    expect(Math.abs(newScrollPosition - scrollPosition)).toBeLessThan(100);
  });

  test('should show 404 error for non-existent account', async ({ page }) => {
    await page.route('**/api/tenants/*/accounts/non-existent-id', async route => {
      await route.fulfill({
        status: 404,
        body: JSON.stringify({ message: 'Account not found' })
      });
    });

    await page.goto('/accounts/non-existent-id');
    
    // Should show error message
    await expect(page.locator('text=/not found|404/i')).toBeVisible();
  });
});
