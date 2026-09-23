import { test, expect } from '@playwright/test';
import { loginAs, ADMIN_EMAIL, ADMIN_PASSWORD } from './fixtures';

test.describe('Admin coupon management (FIG-475)', () => {
  test('admin can create, see, edit, and deactivate a coupon', async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/admin/coupons');
    await expect(page.getByRole('heading', { name: 'Coupons' })).toBeVisible();

    const code = `E2E${Date.now()}`;
    await page.getByRole('button', { name: 'New Coupon' }).click();
    await page.getByLabel('Code').fill(code);
    await page.getByLabel(/Discount \(%\)/).fill('15');
    await page.getByRole('button', { name: 'Create' }).click();

    await expect(page.getByText('Coupon created')).toBeVisible();
    await expect(page.getByText(code)).toBeVisible();
    await expect(page.getByText('15%')).toBeVisible();

    // Edit it
    const row = page.locator('tr', { hasText: code });
    await row.getByTitle('Edit').click();
    await page.getByLabel(/Discount \(%\)/).fill('25');
    await page.getByRole('button', { name: 'Update' }).click();
    await expect(page.getByText('Coupon updated')).toBeVisible();
    await expect(page.getByText('25%')).toBeVisible();

    // Deactivate
    await row.getByTitle('Deactivate').click();
    await expect(page.getByText('Coupon status updated')).toBeVisible();
    await expect(row.getByText('Inactive')).toBeVisible();
  });
});
