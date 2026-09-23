import { test, expect, request } from '@playwright/test';
import { loginAs, dismissCookieBanner, ADMIN_EMAIL, ADMIN_PASSWORD, CUSTOMER_EMAIL, CUSTOMER_PASSWORD } from './fixtures';

const API_BASE = 'http://localhost:4000';

async function adminApi() {
  const api = await request.newContext();
  await api.get(`${API_BASE}/auth/csrf`);
  const token = (await api.storageState()).cookies.find((c) => c.name === 'XSRF-TOKEN')!.value;
  await api.post(`${API_BASE}/auth/login`, {
    headers: { 'x-xsrf-token': token },
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  return { api, token };
}

test.describe('Guest cart merge-on-login (FIG-474)', () => {
  test('basic case: a guest-added item appears in the account cart after login', async ({ page }) => {
    await page.goto('/products');
    await dismissCookieBanner(page);
    const firstProductLink = page.locator('a[href^="/products/"]').first();
    await firstProductLink.click();
    await page.waitForURL(/\/products\/[^/]+$/);
    await page.getByRole('button', { name: /Add to Cart/ }).first().click();
    await expect(page.getByRole('button', { name: /Added!/ }).first()).toBeVisible();

    await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD);
    await page.goto('/cart');
    await expect(page.locator('body')).not.toContainText('Your cart is empty');
  });

  test('known bug: a mid-sync failure can double an earlier item\'s quantity on the next login (see FIG-474)', async ({ page }) => {
    const { api, token } = await adminApi();

    // Two distinct in-stock products to add as a guest.
    const productsRes = await api.get(`${API_BASE}/products?limit=2`);
    const products = (await productsRes.json()).data;
    test.skip(products.length < 2, 'Need at least 2 seeded products for this test');
    const [productA, productB] = products;

    // Clear whatever's in the customer's real backend cart from other specs,
    // so the "before" quantity we compare against is known and clean.
    await api.post(`${API_BASE}/auth/login`, {
      headers: { 'x-xsrf-token': token },
      data: { email: CUSTOMER_EMAIL, password: CUSTOMER_PASSWORD },
    });
    const existingCart = await (await api.get(`${API_BASE}/cart`)).json();
    for (const item of existingCart.items ?? []) {
      await api.delete(`${API_BASE}/cart/items/${item.id}`, { headers: { 'x-xsrf-token': token } });
    }

    // Guest adds both products via the real UI/localStorage path.
    await page.goto(`/products/${productA.slug}`);
    await dismissCookieBanner(page);
    await page.getByRole('button', { name: /Add to Cart/ }).first().click();
    await expect(page.getByRole('button', { name: /Added!/ }).first()).toBeVisible();
    await page.goto(`/products/${productB.slug}`);
    await page.getByRole('button', { name: /Add to Cart/ }).first().click();
    await expect(page.getByRole('button', { name: /Added!/ }).first()).toBeVisible();

    // Make product B's sync fail server-side (product deactivated).
    const adminOnlyApi = await request.newContext();
    await adminOnlyApi.get(`${API_BASE}/auth/csrf`);
    const adminToken = (await adminOnlyApi.storageState()).cookies.find((c) => c.name === 'XSRF-TOKEN')!.value;
    await adminOnlyApi.post(`${API_BASE}/auth/login`, {
      headers: { 'x-xsrf-token': adminToken },
      data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
    });
    await adminOnlyApi.patch(`${API_BASE}/admin/products/${productB.id}`, {
      headers: { 'x-xsrf-token': adminToken },
      data: { isActive: false },
    });

    try {
      // First login triggers AuthBootstrap's syncCart: product A succeeds,
      // product B fails (inactive) and throws -- caught and only logged,
      // so localStorage keeps BOTH guest items per cartStore.ts's catch block.
      await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD);
      await page.waitForTimeout(1000); // let the sync's fire-and-forget requests land

      // Reloading remounts AuthBootstrap, re-triggering syncCart with the
      // SAME still-populated guestCart -- product A gets re-POSTed on top of
      // its already-synced quantity.
      await page.reload();
      await page.waitForTimeout(1000);

      const cartAfter = await (await api.get(`${API_BASE}/cart`)).json();
      const lineA = cartAfter.items?.find(
        (i: { productId: string; quantity: number }) => i.productId === productA.id,
      );

      console.log(`FIG-474 repro: product A quantity after two logins = ${lineA?.quantity} (bug present if > 1)`);
      // Documenting current behavior rather than asserting a fix that doesn't exist yet:
      // this is expected to be 2 (bug reproduced) until FIG-474 is actually fixed.
      expect(lineA?.quantity).toBe(2);
    } finally {
      await adminOnlyApi.patch(`${API_BASE}/admin/products/${productB.id}`, {
        headers: { 'x-xsrf-token': adminToken },
        data: { isActive: true },
      });
      await adminOnlyApi.dispose();
    }

    await api.dispose();
  });
});
