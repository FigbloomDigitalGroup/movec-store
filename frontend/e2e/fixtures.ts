import { type Page } from '@playwright/test';

// Sourced from env vars rather than hardcoded, since the seed script
// generates a random password per machine -- set E2E_ADMIN_PASSWORD /
// E2E_CUSTOMER_PASSWORD (printed to the console the first time
// `npx prisma db seed` runs) before running this suite. The fallback
// strings below are deliberately invalid so an unset var fails loudly at
// login rather than silently trying a stale password.
export const ADMIN_EMAIL = 'admin@example.com';
export const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD ?? 'SET_E2E_ADMIN_PASSWORD_ENV_VAR';
export const CUSTOMER_EMAIL = 'customer@example.com';
export const CUSTOMER_PASSWORD = process.env.E2E_CUSTOMER_PASSWORD ?? 'SET_E2E_CUSTOMER_PASSWORD_ENV_VAR';

export async function dismissCookieBanner(page: Page) {
  const acceptAll = page.getByRole('button', { name: 'Accept All' });
  if (await acceptAll.isVisible().catch(() => false)) {
    await acceptAll.click();
  }
}

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto('/login');
  await dismissCookieBanner(page);
  // Label text is actually "Email *" / "Password *" (the required-indicator
  // span lives inside the <label>), and "Password" substring-matches the
  // "Show password" toggle button too -- IDs from Login.tsx are unambiguous.
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
}
