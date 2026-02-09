import { test, expect } from '@playwright/test';

test.describe('Invoice Metadata Validation', () => {
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
    notes: '',
    internalReference: '',
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

    await page.goto(`${baseUrl}/invoices/${invoiceId}`);
    await page.locator('[data-testid="edit-metadata-button"]').click();
  });

  test('should display error for invalid email format', async ({ page }) => {
    await page.locator('[data-testid="billing-contact-input"]').fill('invalid-email');
    
    // Verify validation error
    const errorMessage = page.locator('[data-testid="billing-contact-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Invalid email format');
    
    // Verify save button disabled
    await expect(page.locator('[data-testid="save-metadata-button"]')).toBeDisabled();
  });

  test('should accept valid email formats', async ({ page }) => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'first+last@company.net',
      'admin@subdomain.example.com'
    ];

    for (const email of validEmails) {
      await page.locator('[data-testid="billing-contact-input"]').fill(email);
      
      // Verify no error
      await expect(page.locator('[data-testid="billing-contact-error"]')).not.toBeVisible();
      
      // Verify save button enabled
      await expect(page.locator('[data-testid="save-metadata-button"]')).toBeEnabled();
    }
  });

  test('should enforce maximum length for notes field', async ({ page }) => {
    const longNotes = 'A'.repeat(1001); // Assuming 1000 char limit
    
    await page.locator('[data-testid="notes-input"]').fill(longNotes);
    
    // Verify validation error
    const errorMessage = page.locator('[data-testid="notes-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Maximum 1000 characters');
    
    // Verify save button disabled
    await expect(page.locator('[data-testid="save-metadata-button"]')).toBeDisabled();
  });

  test('should display character count for notes field', async ({ page }) => {
    const notes = 'Test notes content';
    
    await page.locator('[data-testid="notes-input"]').fill(notes);
    
    // Verify character count displayed
    const charCount = page.locator('[data-testid="notes-char-count"]');
    await expect(charCount).toBeVisible();
    await expect(charCount).toContainText(`${notes.length} / 1000`);
  });

  test('should enforce maximum length for internal reference', async ({ page }) => {
    const longRef = 'A'.repeat(101); // Assuming 100 char limit
    
    await page.locator('[data-testid="internal-reference-input"]').fill(longRef);
    
    // Verify validation error
    const errorMessage = page.locator('[data-testid="internal-reference-error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Maximum 100 characters');
    
    // Verify save button disabled
    await expect(page.locator('[data-testid="save-metadata-button"]')).toBeDisabled();
  });

  test('should allow empty optional fields', async ({ page }) => {
    // Clear all fields
    await page.locator('[data-testid="notes-input"]').fill('');
    await page.locator('[data-testid="internal-reference-input"]').fill('');
    await page.locator('[data-testid="billing-contact-input"]').fill('');
    
    // Verify no errors (all fields optional)
    await expect(page.locator('[data-testid="notes-error"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="internal-reference-error"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="billing-contact-error"]')).not.toBeVisible();
    
    // Verify save button enabled
    await expect(page.locator('[data-testid="save-metadata-button"]')).toBeEnabled();
  });

  test('should validate on blur', async ({ page }) => {
    const billingContactInput = page.locator('[data-testid="billing-contact-input"]');
    
    await billingContactInput.fill('invalid-email');
    await billingContactInput.blur();
    
    // Verify error appears after blur
    const errorMessage = page.locator('[data-testid="billing-contact-error"]');
    await expect(errorMessage).toBeVisible();
  });

  test('should clear validation error when corrected', async ({ page }) => {
    const billingContactInput = page.locator('[data-testid="billing-contact-input"]');
    
    // Enter invalid email
    await billingContactInput.fill('invalid-email');
    await expect(page.locator('[data-testid="billing-contact-error"]')).toBeVisible();
    
    // Correct email
    await billingContactInput.fill('valid@example.com');
    
    // Verify error cleared
    await expect(page.locator('[data-testid="billing-contact-error"]')).not.toBeVisible();
  });

  test('should validate all fields before save', async ({ page }) => {
    // Set multiple invalid values
    await page.locator('[data-testid="notes-input"]').fill('A'.repeat(1001));
    await page.locator('[data-testid="billing-contact-input"]').fill('invalid-email');
    
    // Click save
    await page.locator('[data-testid="save-metadata-button"]').click();
    
    // Verify both errors displayed
    await expect(page.locator('[data-testid="notes-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="billing-contact-error"]')).toBeVisible();
    
    // Verify no API call made
    await expect(page.locator('[data-testid="success-message"]')).not.toBeVisible();
  });

  test('should trim whitespace from inputs', async ({ page }) => {
    let savedData: any = null;
    
    await page.route(`**/api/tenants/*/accounts/*/invoices/${invoiceId}/metadata`, async (route) => {
      savedData = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: mockInvoice })
      });
    });

    // Enter values with whitespace
    await page.locator('[data-testid="internal-reference-input"]').fill('  REF-001  ');
    await page.locator('[data-testid="billing-contact-input"]').fill('  user@example.com  ');
    
    await page.locator('[data-testid="save-metadata-button"]').click();
    await page.waitForLoadState('networkidle');
    
    // Verify trimmed values saved
    expect(savedData.internalReference).toBe('REF-001');
    expect(savedData.billingContact).toBe('user@example.com');
  });
});
