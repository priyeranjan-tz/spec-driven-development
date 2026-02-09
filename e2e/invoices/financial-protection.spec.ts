import { test, expect } from '@playwright/test';

test.describe('Financial Data Protection', () => {
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
    notes: 'Notes',
    internalReference: 'REF-001',
    billingContact: 'billing@example.com',
    lineItems: [
      {
        id: 'line-001',
        rideId: 'ride-001',
        rideDate: '2026-01-15T10:30:00Z',
        fareCents: 125000,
        description: 'Pickup: 123 Main St | Dropoff: 456 Oak Ave'
      },
      {
        id: 'line-002',
        rideId: 'ride-002',
        rideDate: '2026-01-20T14:45:00Z',
        fareCents: 125000,
        description: 'Pickup: 789 Elm St | Dropoff: 321 Pine St'
      }
    ]
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

  test('should NOT display financial amount inputs in edit mode', async ({ page }) => {
    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    // Verify financial fields are not editable inputs
    await expect(page.locator('input[data-testid="subtotal-input"]')).not.toBeVisible();
    await expect(page.locator('input[data-testid="tax-input"]')).not.toBeVisible();
    await expect(page.locator('input[data-testid="total-input"]')).not.toBeVisible();
  });

  test('should display financial amounts as read-only text in edit mode', async ({ page }) => {
    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    // Verify amounts displayed but not editable
    const subtotalDisplay = page.locator('[data-testid="subtotal-display"]');
    const taxDisplay = page.locator('[data-testid="tax-display"]');
    const totalDisplay = page.locator('[data-testid="total-display"]');
    
    await expect(subtotalDisplay).toBeVisible();
    await expect(taxDisplay).toBeVisible();
    await expect(totalDisplay).toBeVisible();
    
    // Verify values correct
    await expect(subtotalDisplay).toContainText('$2,500.00');
    await expect(taxDisplay).toContainText('$225.00');
    await expect(totalDisplay).toContainText('$2,725.00');
  });

  test('should NOT allow editing line items in edit mode', async ({ page }) => {
    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    // Verify line items table exists
    const lineItemsTable = page.locator('[data-testid="line-items-table"]');
    await expect(lineItemsTable).toBeVisible();
    
    // Verify no edit buttons or inputs for line items
    await expect(page.locator('[data-testid="add-line-item-button"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="delete-line-item-button"]')).not.toBeVisible();
    await expect(page.locator('input[data-testid^="line-item-fare-"]')).not.toBeVisible();
  });

  test('should display protection tooltip on financial fields', async ({ page }) => {
    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    // Hover over financial field
    const subtotalDisplay = page.locator('[data-testid="subtotal-display"]');
    await subtotalDisplay.hover();
    
    // Verify tooltip explaining protection
    const tooltip = page.locator('[data-testid="financial-protection-tooltip"]');
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toContainText('Financial data is protected and cannot be edited');
  });

  test('should display lock icon on protected fields', async ({ page }) => {
    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    // Verify lock icons present
    const subtotalLock = page.locator('[data-testid="subtotal-lock-icon"]');
    const taxLock = page.locator('[data-testid="tax-lock-icon"]');
    const totalLock = page.locator('[data-testid="total-lock-icon"]');
    
    await expect(subtotalLock).toBeVisible();
    await expect(taxLock).toBeVisible();
    await expect(totalLock).toBeVisible();
  });

  test('should NOT send financial data in save request', async ({ page }) => {
    let savedData: any = null;
    
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/metadata`, async (route) => {
      savedData = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    // Edit metadata only
    await page.locator('[data-testid="notes-input"]').fill('Updated notes');
    await page.locator('[data-testid="save-metadata-button"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify financial fields NOT in request
    expect(savedData.subtotalCents).toBeUndefined();
    expect(savedData.taxCents).toBeUndefined();
    expect(savedData.totalCents).toBeUndefined();
    expect(savedData.lineItems).toBeUndefined();
    
    // Verify only metadata fields present
    expect(savedData.notes).toBeDefined();
    expect(savedData.internalReference).toBeDefined();
    expect(savedData.billingContact).toBeDefined();
  });

  test('should NOT allow editing invoice number', async ({ page }) => {
    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    // Verify invoice number is not editable
    await expect(page.locator('input[data-testid="invoice-number-input"]')).not.toBeVisible();
    
    // Verify displayed as read-only text
    const invoiceNumberDisplay = page.locator('[data-testid="invoice-number"]');
    await expect(invoiceNumberDisplay).toBeVisible();
    await expect(invoiceNumberDisplay).toContainText('INV-2026-001');
  });

  test('should NOT allow editing billing period dates', async ({ page }) => {
    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    // Verify dates not editable
    await expect(page.locator('input[data-testid="billing-period-start-input"]')).not.toBeVisible();
    await expect(page.locator('input[data-testid="billing-period-end-input"]')).not.toBeVisible();
  });

  test('should NOT allow editing invoice status', async ({ page }) => {
    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    // Verify status not editable
    await expect(page.locator('select[data-testid="status-select"]')).not.toBeVisible();
    await expect(page.locator('input[data-testid="status-input"]')).not.toBeVisible();
  });

  test('should display visual indicator separating editable from protected fields', async ({ page }) => {
    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
    
    // Verify editable fields section
    const editableSection = page.locator('[data-testid="editable-fields-section"]');
    await expect(editableSection).toBeVisible();
    await expect(editableSection).toContainText('Editable Information');
    
    // Verify protected fields section
    const protectedSection = page.locator('[data-testid="protected-fields-section"]');
    await expect(protectedSection).toBeVisible();
    await expect(protectedSection).toContainText('Protected Financial Data');
  });
});
