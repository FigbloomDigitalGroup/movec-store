# Migrating the Database: Render → Supabase

## What's changing / what isn't

- **Database:** Render Postgres → Supabase Postgres. This is the only thing moving.
- **Backend hosting:** stays on Render (`movec-api`).
- **Images:** stay on Cloudinary, untouched. Products don't store image *files* in
  the database — only a Cloudinary `imageUrl` string (see `prisma/seed.ts`,
  `products.service.ts`). Once the product **rows** are restored on Supabase, the
  image URLs come with them automatically. There's nothing to "add" for images
  beyond this data migration.
- Repo changes already made as part of this guide:
  - `backend/prisma/schema.prisma` — datasource now has `directUrl` alongside `url`
    (Supabase needs a separate direct connection for migrations; the pooled one
    can't run DDL).
  - `backend/.env` / `.env.example` — added `DIRECT_URL`.
  - `render.yaml` — removed the Render-managed `movec-db` database block and the
    `fromDatabase` binding (Supabase isn't a Render resource, so `DATABASE_URL`/
    `DIRECT_URL` are now set manually in the Render dashboard, like the other
    secrets already were). Also dropped the `prisma migrate resolve --rolled-back
    20260805000000_stripe_to_paystack` step from the start command — that
    migration no longer exists in `prisma/migrations/`, so it was dead weight.

## 1. Get both connection strings

**Render (source — grab this before it's gone; free Postgres instances expire):**
Render dashboard → `movec-db` → **Connect** → copy the *External Database URL*.

**Supabase (target):**
Create a project at supabase.com, then Project Settings → Database → Connection
string. Supabase gives you two you need:
- **Transaction pooler** (port `6543`, `?pgbouncer=true`) → this becomes `DATABASE_URL`
  (what the running app uses).
- **Direct connection** (port `5432`) → this becomes `DIRECT_URL` (what `prisma
  migrate` and `pg_dump`/`pg_restore` use — the pooler doesn't support the
  session features migrations need).

## 2. Create the schema on Supabase

Point both env vars at Supabase locally (temporarily, just for this migration —
your `backend/.env` can go back to local Postgres afterward for day-to-day dev):

```bash
cd backend
npx prisma migrate deploy
```

This creates all tables (empty) and Prisma's own `_prisma_migrations` bookkeeping
table on Supabase, using your existing migration history — no manual SQL needed.

## 3. Copy the data over

All models use `@id @default(uuid())`, not auto-increment integers, so there are
no sequences to reset after restoring — a plain data-only dump/restore is enough.

PowerShell doesn't have `pg_dump` on PATH by default; it's bundled with your local
Postgres install at `C:\Program Files\PostgreSQL\18\bin`.

```powershell
$pg = "C:\Program Files\PostgreSQL\18\bin"

# Dump data only from Render, skip Prisma's own bookkeeping table
& "$pg\pg_dump.exe" --data-only --no-owner --no-acl `
  --exclude-table=_prisma_migrations `
  -Fc -f movec_data.dump "<RENDER_EXTERNAL_DATABASE_URL>"

# Restore into Supabase (use the DIRECT connection string, not the pooler)
& "$pg\pg_restore.exe" --data-only --no-owner --no-acl `
  --disable-triggers `
  -d "<SUPABASE_DIRECT_URL>" movec_data.dump
```

`--disable-triggers` lets rows load without foreign-key checks firing mid-restore
(pg_restore still respects table order from the dump's TOC). Ignore
`already exists` / role-ownership warnings — expected with `--no-owner --no-acl`.

## 4. Point the app at Supabase for real

- **Local `.env`:** update `DATABASE_URL` and `DIRECT_URL` if you want local dev
  against Supabase too, otherwise leave it on local Postgres.
- **Render dashboard** (`movec-api` service → Environment): add/update
  `DATABASE_URL` (pooled) and `DIRECT_URL` (direct). Since `render.yaml` no longer
  binds these to a Render database, this manual step is required — same as
  `JWT_SECRET`, `CLOUDINARY_*`, etc. already were.
- Redeploy the Render service.

## 5. Verify

- [ ] Render health check responds (`/`)
- [ ] Admin login works (`admin@movec.co.ke` / seed password, or your real admin)
- [ ] Product list loads and images render (proves both the data restore and
      Cloudinary URLs are intact)
- [ ] Place a test order end-to-end
- [ ] Old Render Postgres can be deleted once the above is confirmed
