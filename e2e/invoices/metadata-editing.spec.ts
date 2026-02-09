import { test, expect } from '@playwright/test';

test.describe('Invoice Metadata Editing', () => {
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
    notes: 'Initial notes',
    internalReference: 'REF-001',
    billingContact: 'billing@example.com',
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

  test('should display edit button on invoice detail page', async ({ page }) => {
    await page.goto(`${baseUrl}?tab=invoices`);
    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    const editButton = page.locator('[data-testid="edit-metadata-button"]');
    await expect(editButton).toBeVisible();
    await expect(editButton).toContainText('Edit');
  });

  test('should enter edit mode when edit button clicked', async ({ page }) => {
    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    // Verify edit mode UI
    await expect(page.locator('[data-testid="save-metadata-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="cancel-metadata-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="notes-input"]')).toBeEnabled();
    await expect(page.locator('[data-testid="internal-reference-input"]')).toBeEnabled();
    await expect(page.locator('[data-testid="billing-contact-input"]')).toBeEnabled();
  });

  test('should display current metadata values in edit mode', async ({ page }) => {
    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    // Verify current values populated
    await expect(page.locator('[data-testid="notes-input"]')).toHaveValue('Initial notes');
    await expect(page.locator('[data-testid="internal-reference-input"]')).toHaveValue('REF-001');
    await expect(page.locator('[data-testid="billing-contact-input"]')).toHaveValue('billing@example.com');
  });

  test('should save metadata changes', async ({ page }) => {
    let updateCalled = false;
    
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/metadata`, async (route) => {
      updateCalled = true;
      const requestBody = route.request().postDataJSON();
      
      expect(requestBody.notes).toBe('Updated notes');
      expect(requestBody.internalReference).toBe('REF-002');
      expect(requestBody.billingContact).toBe('updated@example.com');
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            ...mockInvoice,
            notes: requestBody.notes,
            internalReference: requestBody.internalReference,
            billingContact: requestBody.billingContact,
            updatedAt: '2026-02-02T00:00:00Z'
          }
        })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    // Edit values
    await page.locator('[data-testid="notes-input"]').fill('Updated notes');
    await page.locator('[data-testid="internal-reference-input"]').fill('REF-002');
    await page.locator('[data-testid="billing-contact-input"]').fill('updated@example.com');
    
    // Save changes
    await page.locator('[data-testid="save-metadata-button"]').click();
    await page.waitForLoadState('networkidle');
    
    expect(updateCalled).toBe(true);
    
    // Verify edit mode closed
    await expect(page.locator('[data-testid="edit-metadata-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="save-metadata-button"]')).not.toBeVisible();
  });

  test('should cancel metadata editing', async ({ page }) => {
    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    // Make changes
    await page.locator('[data-testid="notes-input"]').fill('Changed notes');
    await page.locator('[data-testid="internal-reference-input"]').fill('REF-999');
    
    // Cancel
    await page.locator('[data-testid="cancel-metadata-button"]').click();
    
    // Verify edit mode closed and changes discarded
    await expect(page.locator('[data-testid="edit-metadata-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="notes-input"]')).not.toBeVisible();
    
    // Reopen edit mode and verify original values restored
    await page.locator('[data-testid="edit-metadata-button"]').click();
    await expect(page.locator('[data-testid="notes-input"]')).toHaveValue('Initial notes');
    await expect(page.locator('[data-testid="internal-reference-input"]')).toHaveValue('REF-001');
  });

  test('should display loading state during save', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/metadata`, async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    await page.locator('[data-testid="notes-input"]').fill('Updated');
    await page.locator('[data-testid="save-metadata-button"]').click();
    
    // Verify loading state
    await expect(page.locator('[data-testid="save-metadata-button"]')).toBeDisabled();
    await expect(page.locator('[data-testid="save-metadata-button"]')).toContainText('Saving');
  });

  test('should display success message after save', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/metadata`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { ...mockInvoice, updatedAt: '2026-02-02T00:00:00Z' } })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    await page.locator('[data-testid="notes-input"]').fill('Updated');
    await page.locator('[data-testid="save-metadata-button"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify success message
    const successMessage = page.locator('[data-testid="success-message"]');
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText('Metadata updated successfully');
  });

  test('should handle save errors', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/metadata`, async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    await page.locator('[data-testid="notes-input"]').fill('Updated');
    await page.locator('[data-testid="save-metadata-button"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify error message
    const errorMessage = page.locator('[data-testid="error-message"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Failed to update metadata');
    
    // Verify still in edit mode
    await expect(page.locator('[data-testid="save-metadata-button"]')).toBeVisible();
  });

  test('should update displayed timestamp after save', async ({ page }) => {
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/metadata`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            ...mockInvoice,
            notes: 'Updated',
            updatedAt: '2026-02-02T10:30:00Z'
          }
        })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    await page.locator('[data-testid="notes-input"]').fill('Updated');
    await page.locator('[data-testid="save-metadata-button"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify updated timestamp displayed
    const updatedAt = page.locator('[data-testid="updated-at"]');
    await expect(updatedAt).toBeVisible();
    await expect(updatedAt).toContainText('2026');
  });
});
