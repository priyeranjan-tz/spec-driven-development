import { test, expect } from '@playwright/test';

/**
 * E2E tests for account list view
 * Tests empty state, loading state, and success state
 * User Story 1: Account Selection and Navigation
 */

test.describe('Account List View', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
    });
  });

  test('should display loading state while fetching accounts', async ({ page }) => {
    // Intercept API call and delay response
    await page.route('**/api/tenants/*/accounts*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.goto('/accounts');
    
    // Should show loading spinner
    await expect(page.locator('text=Loading')).toBeVisible();
  });

  test('should display empty state when no accounts exist', async ({ page }) => {
    // Mock empty response
    await page.route('**/api/tenants/*/accounts*', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.goto('/accounts');
    
    // Should show empty state
    await expect(page.locator('text=/no.*accounts/i')).toBeVisible();
  });

  test('should display list of accounts with correct data', async ({ page }) => {
    // Mock accounts response
    const mockAccounts = [
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'General Hospital',
        type: 'organization',
        currentBalance: 125050,
        lastInvoiceDate: '2026-01-15',
        status: 'active',
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2026-02-01T00:00:00Z'
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174002',
        tenantId: '123e4567-e89b-12d3-a456-426614174000',
        name: 'John Doe',
        type: 'individual',
        currentBalance: -5000,
        lastInvoiceDate: '2026-02-01',
        status: 'active',
        createdAt: '2025-06-01T00:00:00Z',
        updatedAt: '2026-02-05T00:00:00Z'
      }
    ];

    await page.route('**/api/tenants/*/accounts*', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: mockAccounts,
          pagination: { page: 1, pageSize: 50, totalItems: 2, totalPages: 1, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.goto('/accounts');
    
    // Should display account names
    await expect(page.locator('text=General Hospital')).toBeVisible();
    await expect(page.locator('text=John Doe')).toBeVisible();
    
    // Should display account types
    await expect(page.locator('text=/organization/i')).toBeVisible();
    await expect(page.locator('text=/individual/i')).toBeVisible();
    
    // Should display balances (formatted as currency)
    await expect(page.locator('text=/\\$1,250\\.50/')).toBeVisible();
    await expect(page.locator('text=/-\\$50\\.00/')).toBeVisible();
    
    // Should display status
    await expect(page.locator('text=/active/i').first()).toBeVisible();
  });

  test('should display error state when API call fails', async ({ page }) => {
    // Mock failed response
    await page.route('**/api/tenants/*/accounts*', async route => {
      await route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Internal server error' })
      });
    });

    await page.goto('/accounts');
    
    // Should show error message
    await expect(page.locator('text=/error|wrong/i')).toBeVisible();
    
    // Should show retry button
    await expect(page.locator('button:has-text("Retry")')).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    // Mock first page
    await page.route('**/api/tenants/*/accounts?page=1*', async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: Array(50).fill(null).map((_, i) => ({
            id: `account-${i}`,
            tenantId: 'tenant-1',
            name: `Account ${i}`,
            type: 'organization',
            currentBalance: 100000 + i,
            lastInvoiceDate: '2026-01-15',
            status: 'active',
            createdAt: '2025-01-01T00:00:00Z',
            updatedAt: '2026-02-01T00:00:00Z'
          })),
          pagination: { page: 1, pageSize: 50, totalItems: 100, totalPages: 2, hasNext: true, hasPrevious: false }
        })
      });
    });

    await page.goto('/accounts');
    
    // Should show pagination controls
    await expect(page.locator('text=/showing.*50.*of.*100/i')).toBeVisible();
    await expect(page.locator('button:has-text("Next")')).toBeEnabled();
  });
});
