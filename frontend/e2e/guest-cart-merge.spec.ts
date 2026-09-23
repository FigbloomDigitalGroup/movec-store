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

  test('fixed: a mid-sync failure no longer doubles an earlier item\'s quantity on the next login (see FIG-474)', async ({ page }) => {
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
      // First login triggers AuthBootstrap's syncCart: product A succeeds and is
      // removed from localStorage individually; product B fails (inactive) and
      // stays in localStorage on its own per cartStore.ts's per-item handling.
      await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD);
      await page.waitForTimeout(1000); // let the sync's fire-and-forget requests land

      // Reloading remounts AuthBootstrap, re-triggering syncCart with only the
      // still-failing product B left in guestCart -- product A must NOT be
      // re-POSTed since it was already cleared after its successful sync.
      await page.reload();
      await page.waitForTimeout(1000);

      const cartAfter = await (await api.get(`${API_BASE}/cart`)).json();
      const lineA = cartAfter.items?.find(
        (i: { productId: string; quantity: number }) => i.productId === productA.id,
      );
      const lineB = cartAfter.items?.find(
        (i: { productId: string; quantity: number }) => i.productId === productB.id,
      );

      // Product A synced once and must not have been doubled by the retry.
      expect(lineA?.quantity).toBe(1);
      // Product B never synced (its product was inactive), so it's absent.
      expect(lineB).toBeUndefined();
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
