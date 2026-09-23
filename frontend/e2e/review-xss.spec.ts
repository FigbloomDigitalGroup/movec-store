import { test, expect, request } from '@playwright/test';
import { loginAs, dismissCookieBanner, ADMIN_EMAIL, ADMIN_PASSWORD, CUSTOMER_EMAIL, CUSTOMER_PASSWORD } from './fixtures';

const API_BASE = 'http://localhost:4000';
const PRODUCT_SLUG = 'starlink-roam-kit';

// Makes the test idempotent across reruns: one-review-per-user-per-product
// means a leftover review from a previous run would block this one's submit.
// Searches by the product's own name (admin review search matches
// title/body/user fields/product name -- not slug), then filters to this
// customer's row client-side.
async function deleteAnyExistingReview(customerEmail: string) {
  const api = await request.newContext();
  await api.get(`${API_BASE}/auth/csrf`);
  const token = (await api.storageState()).cookies.find((c) => c.name === 'XSRF-TOKEN')!.value;
  await api.post(`${API_BASE}/auth/login`, {
    headers: { 'x-xsrf-token': token },
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  });
  const list = await (await api.get(`${API_BASE}/admin/reviews?search=Starlink Roam Kit`)).json();
  const mine = (list.data ?? []).filter(
    (r: { user: { email: string }; product: { slug: string } }) =>
      r.user.email === customerEmail && r.product.slug === PRODUCT_SLUG,
  );
  for (const review of mine) {
    await api.delete(`${API_BASE}/admin/reviews/${review.id}`, { headers: { 'x-xsrf-token': token } });
  }
  await api.dispose();
}

// FIG-485: review title/body are user-controlled and rendered on both the
// customer product page and AdminReviews.tsx. Neither uses
// dangerouslySetInnerHTML (grepped the whole frontend -- zero occurrences),
// so React's default JSX interpolation should render these as inert text
// nodes no matter what's stored. This asserts that against the *live DOM*,
// not just the network response: no <script> element materializes and the
// payload's own alert() never fires.
const SCRIPT_PAYLOAD = '<script>window.__xssFired = true;</script>';
const IMG_PAYLOAD = '"><img src=x onerror="window.__xssFired = true">';

test.describe('Review XSS payloads render as inert text (FIG-485)', () => {
  test('script and img/onerror payloads do not execute on the product page or in AdminReviews.tsx', async ({ page }) => {
    let xssFired = false;
    page.on('dialog', async (dialog) => {
      xssFired = true;
      await dialog.dismiss();
    });

    await deleteAnyExistingReview(CUSTOMER_EMAIL);

    await loginAs(page, CUSTOMER_EMAIL, CUSTOMER_PASSWORD);
    await page.goto(`/products/${PRODUCT_SLUG}`);
    await dismissCookieBanner(page);

    await page.getByRole('button', { name: 'Rate 5 stars' }).click();
    await page.locator('input[maxlength="120"]').fill(SCRIPT_PAYLOAD);
    await page.locator('textarea[maxlength="2000"]').fill(IMG_PAYLOAD);
    await page.getByRole('button', { name: /Submit Review/i }).click();
    await expect(page.getByText('Review submitted! Thank you.')).toBeVisible();

    // Reload rather than rely on the query-invalidation timing -- forces a
    // fresh fetch of the reviews list instead of racing it.
    await page.reload();
    await dismissCookieBanner(page);
    // Give any injected script a moment to run if it were going to.
    await page.waitForTimeout(1000);

    // The literal payload text should appear verbatim as text content.
    await expect(page.getByText(SCRIPT_PAYLOAD, { exact: false })).toBeVisible();
    await expect(page.getByText(IMG_PAYLOAD, { exact: false })).toBeVisible();

    // No actual <script> element was injected into the page from this payload.
    const scriptTags = await page.locator('script').allTextContents();
    expect(scriptTags.some((s) => s.includes('__xssFired'))).toBe(false);
    // No <img> with the malicious onerror actually got created as a live element.
    const injectedImg = await page.locator('img[onerror]').count();
    expect(injectedImg).toBe(0);

    expect(xssFired, 'a dialog fired, meaning the payload actually executed').toBe(false);
    expect(await page.evaluate(() => (window as unknown as { __xssFired?: boolean }).__xssFired)).toBeFalsy();

    // Same two payloads, now checked in the admin review moderation view.
    await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
    await page.goto('/admin/reviews');
    await dismissCookieBanner(page);
    await page.waitForTimeout(500);

    await expect(page.getByText(SCRIPT_PAYLOAD, { exact: false })).toBeVisible();
    await expect(page.getByText(IMG_PAYLOAD, { exact: false })).toBeVisible();
    const adminScriptTags = await page.locator('script').allTextContents();
    expect(adminScriptTags.some((s) => s.includes('__xssFired'))).toBe(false);
    expect(await page.locator('img[onerror]').count()).toBe(0);
    expect(xssFired).toBe(false);
  });
});
