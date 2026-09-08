# Database Backups

Supabase's free tier has no automated backups or point-in-time recovery, so
this repo runs its own: a scheduled GitHub Actions workflow at
[.github/workflows/db-backup.yml](../.github/workflows/db-backup.yml) that
dumps the database daily and keeps each dump as a downloadable workflow
artifact.

## How it works

- Runs daily at 03:00 UTC (06:00 EAT), plus on-demand via the Actions tab
  ("Run workflow").
- Uses `pg_dump` (via the official `postgres:17` Docker image, so the client
  version doesn't drift from whatever Supabase runs) against the **direct**
  connection (port 5432) — the pooled `DATABASE_URL` can't run everything
  `pg_dump` needs.
- Uploads the `.dump` file (custom format, includes schema + data) as a
  workflow artifact named `db-backup-<run-id>`.
- Artifacts are kept for 90 days, then auto-deleted by GitHub. This is a
  rolling window, not indefinite archival — see "Long-term retention" below
  if you need older backups kept longer.

## One-time setup

Add the direct connection string as a repo secret (Settings → Secrets and
variables → Actions → New repository secret):

- Name: `SUPABASE_DIRECT_URL`
- Value: the same value as `DIRECT_URL` in `backend/.env` (the port-5432
  direct connection, not the `:6543` pooler one)

Without this secret the workflow fails fast with a clear error instead of
silently producing an empty/broken backup.

## Downloading a backup

Actions tab → **Database Backup** workflow → pick a run → download the
`db-backup-<run-id>` artifact (a zip containing the `.dump` file). Or via CLI:

```bash
gh run list --workflow=db-backup.yml
gh run download <run-id>
```

## Restoring a backup

Same pattern as the [Render → Supabase migration](./07-SUPABASE-MIGRATION.md),
but restoring the full dump (schema + data) rather than a data-only one:

```powershell
$pg = "C:\Program Files\PostgreSQL\18\bin"
& "$pg\pg_restore.exe" --no-owner --no-acl --clean --if-exists `
  -d "<TARGET_DIRECT_URL>" movec-<timestamp>.dump
```

`--clean --if-exists` drops existing objects before recreating them, so this
is safe to run against an empty **or** already-populated database. Always
restore into a fresh/test database first if you're not sure the dump is the
one you want.

## Long-term retention

90 days of rolling daily backups covers "someone fat-fingered a delete
yesterday." It does not cover "we need last year's data." If that need shows
up, the next step is a second workflow step that uploads the same dump to
durable storage (S3, Backblaze B2, etc.) instead of/alongside the GitHub
artifact — not built yet since it needs a storage account and credentials.

## Before risky changes

Before a schema migration or bulk data operation, trigger the workflow
manually first ("Run workflow" in the Actions tab) rather than waiting for
the nightly run.
