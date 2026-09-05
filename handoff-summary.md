# Handoff — movec-store Visual/UX Modernization

## Task
Visual/UX modernization pass on movec-store frontend (React 19 + Vite + Tailwind v4,
`frontend/` at `c:\Users\joewa\OneDrive\Desktop\movec-store`), per the user's explicit
choice to move past an earlier bug-fix pass into "an actual visual redesign toward a
professional modern SaaS look." Planning phase (design + admin section) is complete;
implementation has not started yet.

## Standing constraints
- Never modify `backend/src/payments/*` or `backend/prisma/schema.prisma`/migrations
  without explicit per-change user confirmation.
- Work incrementally — this plan covers a first slice, not the whole app.
- Frontend-only for this pass.

## Scope decided
Phase A (design-system foundation) + Phase B (admin section: 12 pages + AdminLayout).
Customer-facing pages explicitly deferred to a later Phase C.

## Key design decisions locked in
(verified against real files, not just audit claims)

- **Radius:** `rounded-lg` (small controls) → `rounded-xl` (nested/default) →
  `rounded-2xl` (outer page-section cards) → `rounded-full` (pills/avatars).
  Fold away `rounded-3xl` / bare `rounded`.
- **Shadow:** `shadow-sm` resting → `shadow-md` hover → `shadow-xl` popover →
  `shadow-2xl` modal. No new tokens needed.
- **Grey:** adopt `neutral-*` (already registered in `index.css` `@theme`,
  brand-tinted) as the one system going forward, scoped tightly to
  `components/ui/*` (9 files, 31 occurrences) + admin pages as Phase B touches
  them. Everything else stays `gray-*` for now (no mechanical sweep).
- **Accent:** unify brand-action color to `primary-*`/`accent` (kills blue on
  Dashboard/Products/Modules/Banners/Reviews/AdminLayout sidebar, purple on
  Notifications) — but preserve legitimate multi-color semantic enums (order/ticket
  status, user roles, notification type).
- **New shared components:** `Modal.tsx` (extracted from `ConfirmDialog.tsx`'s proven
  a11y pattern) and `PageHeader.tsx` (codifying the icon+title+subtitle+action recipe
  already best-proven in AdminOrders/AdminSupport).
- **Bundled bug fix:** `CCTVModule.tsx`'s dynamic Tailwind class names
  (`` `bg-${color}-100` ``) are already silently purged in production — needs a
  static lookup map.

## Process so far
1. 2 Explore agents (design-token/customer-page inventory + admin-page inventory)
2. 1 Plan agent — produced a detailed Phase A/B plan, and caught 6 corrections to the
   original research via re-verification (e.g., AdminSupport's modal has no
   Escape/`role="dialog"`, AdminUsers has no real skeleton, the "34 arbitrary shadow"
   claim was wrong — only 9 exist and none in admin).
3. Personally read 6 critical files to spot-check: `index.css`, `AdminLayout.tsx`,
   `Button.tsx`, `Card.tsx`, `ConfirmDialog.tsx`, `PageLoader.tsx` — all confirmed
   accurate.

## Remaining before/during execution
- ~6 open judgment calls (biggest one: how literally to read "kill blue/purple
  everywhere" vs. preserving semantic color-coding) — recommended defaults are stated
  above and in the full plan; flag deviations if they come up during implementation.
- Full plan detail (file-by-file, Phase A then Phase B in priority order:
  Notifications, Banners, Reports, Dashboard, then the remaining 8 admin pages) lives
  at `C:\Users\joewa\.claude\plans\atomic-yawning-knuth.md`.
