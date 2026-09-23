import { test, expect, request } from '@playwright/test';
import { loginAs, ADMIN_EMAIL, ADMIN_PASSWORD, CUSTOMER_EMAIL, CUSTOMER_PASSWORD } from './fixtures';

const API_BASE = 'http://localhost:4000';

// Ensures Paybill/Till are actually configured server-side before the UI
// test relies on them — a fresh local seed has both channels *enabled* but
// with no business number set (see FIG-482), which would otherwise make this
// spec fail for a reason that has nothing to do with the checkout UI itself.
async function csrfToken(api: Awaited<ReturnType<typeof request.newContext>>) {
  await api.get(`${API_BASE}/auth/csrf`);
  const cookie = (await api.storageState()).cookies.find((c) => c.name === 'XSRF-TOKEN');
  if (!cookie) throw new Error('CSRF cookie was not set by /auth/csrf');
  return cookie.value;
}

async function ensurePaybillConfigured() {
  const api = await request.newContext();
  const token = await csrfToken(api);
  await api.post(`${API_BASE}/auth/login`, {
    headers: { 'x-xsrf-token': token },
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const current = await (await api.get(`${API_BASE}/admin/payments/settings`)).json();
  if (!current.paybillNumber) {
    await api.put(`${API_BASE}/admin/payments/settings`, {
      headers: { 'x-xsrf-token': token },
      data: { ...current, paybillNumber: '400200', tillNumber: '100200' },
    });
  }
  await api.dispose();
}

test.describe('Golden path: browse -> cart -> checkout -> pay -> admin confirms', () => {
  test.beforeAll(async () => {
    await ensurePaybillConfigured();
  });

  test('a customer can buy something and an admin can confirm the payment', async ({ browser }) => {
    const customerContext = await browser.newContext();
    const customerPage = await customerContext.newPage();

    await loginAs(customerPage, CUSTOMER_EMAIL, CUSTOMER_PASSWORD);

    await customerPage.goto('/products');
    await customerPage.locator('a[href^="/products/"]').first().click();
    await customerPage.waitForURL(/\/products\/[^/]+$/);
    await customerPage.getByRole('button', { name: /Add to Cart/ }).first().click();
    await expect(customerPage.getByRole('button', { name: /Added!/ }).first()).toBeVisible();

    await customerPage.goto('/cart');
    await customerPage.getByRole('button', { name: 'Proceed to Checkout' }).click();

    await expect(customerPage.getByRole('heading', { name: /checkout/i })).toBeVisible({ timeout: 10000 });
    await customerPage.getByRole('button', { name: 'Place Order' }).click();

    await customerPage.waitForURL(/\/payment\//, { timeout: 10000 });
    const orderNumber = customerPage.url().split('/payment/')[1];
    expect(orderNumber).toBeTruthy();

    await customerPage.getByRole('button', { name: /Pay via Paybill/ }).click();
    await expect(customerPage.getByText(/Business Number/i).first()).toBeVisible();

    // Admin confirms the payment in a separate session, then the customer
    // sees the order move to CONFIRMED -- this is the whole point of the
    // manual Paybill/Till trust model (FIG-482).
    const adminContext = await browser.newContext();
    const adminPage = await adminContext.newPage();
    await loginAs(adminPage, ADMIN_EMAIL, ADMIN_PASSWORD);
    await adminPage.goto('/admin/orders');
    const orderRow = adminPage.locator('tr', { hasText: orderNumber });
    await orderRow.getByRole('button', { name: /update/i }).click();
    await adminPage.getByRole('button', { name: 'Confirm Payment Received' }).click();
    await expect(adminPage.getByText(/confirmed/i).first()).toBeVisible({ timeout: 10000 });

    await customerPage.goto(`/orders/${orderNumber}`);
    await expect(customerPage.getByText(/confirmed/i).first()).toBeVisible({ timeout: 10000 });

    await customerContext.close();
    await adminContext.close();
  });
});
