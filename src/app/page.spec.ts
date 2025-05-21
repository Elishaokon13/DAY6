import { test, expect } from '@playwright/test';

test.describe('Contract Verification UI', () => {
  test('shows error on empty form submit', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Contract Verification-as-a-Service')).toBeVisible();
    await page.getByRole('button', { name: /verify contract/i }).click();
    await expect(page.getByText(/error/i)).toBeVisible();
  });

  // Add more tests for valid input, network selection, etc.
}); 