# E2E tests (Playwright)

Requires both servers already running against a disposable local database — not started automatically (see `playwright.config.ts` for why):

```bash
# Terminal 1 (repo root)
cd backend
DATABASE_URL="postgresql://postgres:postgres@localhost:5436/movec?schema=public" \
DIRECT_URL="postgresql://postgres:postgres@localhost:5436/movec?schema=public" \
npm run start:dev

# Terminal 2
cd frontend
npm run dev
```

Then, from `frontend/`, with the passwords your local seed run printed to the console:

```bash
E2E_ADMIN_PASSWORD="..." E2E_CUSTOMER_PASSWORD="..." npx playwright test
```

Tests assume the standard seed data (`npx prisma db seed`) is present: `admin@example.com` / `customer@example.com`, at least one product in stock, and a Paybill/Till number configured under Admin → Payment Settings (the golden-path spec configures one itself if missing).

## Known constraint: the login throttle

`/auth/login`'s nominal 10-requests/60s limit is *actually* enforced at ~5/60s — the global `ThrottlerModule` guard and the route-level `LoginThrottleGuard` both independently count against the same named ('default') throttler bucket, so every login is counted twice. This is a real, pre-existing property of the app (not introduced by this test suite, and not something to weaken just for test convenience — it's a security control).

Each spec file passes cleanly on its own. Running the **whole suite back-to-back** can trip this after ~2-3 spec files' worth of cumulative logins within the same 60-second window, since nothing resets the in-memory counter between files. If you hit spurious `waitForURL` timeouts on login when running everything at once:
- Run spec files individually (`npx playwright test e2e/golden-path.spec.ts`, etc.), or
- Restart the backend process between spec files (resets the in-memory throttle store), or
- Add a short pause between test files if running unattended.

This is worth fixing properly in the app itself (see the "no per-account/effective-rate-limit clarity" thread in the QA test-pass project) rather than worked around here.
