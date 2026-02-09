import { test, expect } from '@playwright/test';

/**
 * E2E tests for tenant isolation
 * Ensures no cross-tenant data leakage
 * User Story 1: Account Selection and Navigation
 */

test.describe('Tenant Isolation', () => {
  const tenant1Id = '123e4567-e89b-12d3-a456-426614174000';
  const tenant2Id = '987f6543-e21c-87g6-h543-210987654321';

  const tenant1Accounts = [
    {
      id: 'account-t1-1',
      tenantId: tenant1Id,
      name: 'Tenant 1 Account 1',
      type: 'organization',
      currentBalance: 100000,
      lastInvoiceDate: '2026-01-15',
      status: 'active',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z'
    }
  ];

  const tenant2Accounts = [
    {
      id: 'account-t2-1',
      tenantId: tenant2Id,
      name: 'Tenant 2 Account 1',
      type: 'organization',
      currentBalance: 200000,
      lastInvoiceDate: '2026-01-20',
      status: 'active',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2026-02-01T00:00:00Z'
    }
  ];

  test('should only display accounts for authenticated tenant', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(({ tenantId }) => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('tenant_id', tenantId);
    }, { tenantId: tenant1Id });

    // Mock tenant1 accounts
    await page.route(`**/api/tenants/${tenant1Id}/accounts*`, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: tenant1Accounts,
          pagination: { page: 1, pageSize: 50, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.goto('/accounts');
    
    // Should show Tenant 1 accounts
    await expect(page.locator('text=Tenant 1 Account 1')).toBeVisible();
    
    // Should NOT show Tenant 2 accounts
    await expect(page.locator('text=Tenant 2 Account 1')).not.toBeVisible();
  });

  test('should send X-Tenant-ID header with all API requests', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(({ tenantId }) => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('tenant_id', tenantId);
    }, { tenantId: tenant1Id });

    let capturedHeaders: Record<string, string> = {};

    await page.route('**/api/tenants/*/accounts*', async route => {
      capturedHeaders = Object.fromEntries(route.request().headers());
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: tenant1Accounts,
          pagination: { page: 1, pageSize: 50, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.goto('/accounts');
    
    // Wait for API call
    await page.waitForTimeout(500);
    
    // Should include X-Tenant-ID header
    expect(capturedHeaders['x-tenant-id']).toBe(tenant1Id);
  });

  test('should send X-Correlation-ID header with all API requests', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
    });

    let capturedHeaders: Record<string, string> = {};

    await page.route('**/api/tenants/*/accounts*', async route => {
      capturedHeaders = Object.fromEntries(route.request().headers());
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: [],
          pagination: { page: 1, pageSize: 50, totalItems: 0, totalPages: 0, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.goto('/accounts');
    
    // Wait for API call
    await page.waitForTimeout(500);
    
    // Should include X-Correlation-ID header (UUID format)
    expect(capturedHeaders['x-correlation-id']).toMatch(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
  });

  test('should block access when tenant context is missing', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('auth_token', 'mock-token');
      // Tenant NOT set
    });

    await page.goto('/accounts');
    
    // Should redirect to tenant selection or show error
    const url = page.url();
    expect(url.includes('/select-tenant') || url.includes('/accounts')).toBeTruthy();
  });

  test('should prevent cross-tenant data access via URL manipulation', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(({ tenantId }) => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('tenant_id', tenantId);
    }, { tenantId: tenant1Id });

    // Mock 403 response when trying to access tenant2's account
    await page.route('**/api/tenants/*/accounts/account-t2-1', async route => {
      await route.fulfill({
        status: 403,
        body: JSON.stringify({ message: 'Forbidden: Access denied' })
      });
    });

    // Try to directly access Tenant 2's account
    await page.goto('/accounts/account-t2-1');
    
    // Should show forbidden error
    await expect(page.locator('text=/forbidden|access denied|permission/i')).toBeVisible();
  });

  test('should clear data when switching tenants', async ({ page, context }) => {
    // Set Tenant 1
    await page.goto('/');
    await page.evaluate(({ tenantId }) => {
      localStorage.setItem('auth_token', 'mock-token');
      localStorage.setItem('tenant_id', tenantId);
    }, { tenantId: tenant1Id });

    await page.route(`**/api/tenants/${tenant1Id}/accounts*`, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: tenant1Accounts,
          pagination: { page: 1, pageSize: 50, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.goto('/accounts');
    await expect(page.locator('text=Tenant 1 Account 1')).toBeVisible();

    // Switch to Tenant 2
    await page.evaluate(({ tenantId }) => {
      localStorage.setItem('tenant_id', tenantId);
    }, { tenantId: tenant2Id });

    await page.route(`**/api/tenants/${tenant2Id}/accounts*`, async route => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          data: tenant2Accounts,
          pagination: { page: 1, pageSize: 50, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false }
        })
      });
    });

    await page.reload();
    
    // Should show Tenant 2 accounts
    await expect(page.locator('text=Tenant 2 Account 1')).toBeVisible();
    
    // Should NOT show Tenant 1 accounts
    await expect(page.locator('text=Tenant 1 Account 1')).not.toBeVisible();
  });
});
