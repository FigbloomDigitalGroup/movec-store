# Seed Data Best Practices

## Overview

This document explains the proper use of `prisma/seed.ts` and ensures it's understood as a **development/staging bootstrap tool**, not a source of truth for production data.

## Current Implementation ✅

### What We Did Right

1. **Used `upsert` instead of `create`**
   ```typescript
   await prisma.promoBanner.upsert({
     where: { id: 'banner-starlink-gen3' },  // ← Stable ID
     update: {},                              // ← Don't overwrite if exists
     create: { /* ... */ }                    // ← Only create if missing
   });
   ```

2. **Stable IDs for all seed records**
   - Products: `'starlink-standard-kit'` (slug)
   - Banners: `'banner-starlink-gen3'` (custom ID)
   - Services: `'service-starlink-standard'` (custom ID)

3. **Clear documentation in code**
   ```typescript
   // ─── Promo Banners ─────────────────────────────────────────────
   console.log('🎨 Seeding promo banners...');
   ```

## The Problem We're Solving

### ❌ Bad Practice (Before)
```typescript
// Blind create - runs every time
await prisma.product.create({
  name: 'Starlink Kit',
  price: 65000,
});
```

**Issues:**
- Re-running creates duplicates
- Overwrites admin edits
- Production data gets clobbered
- No way to update safely

### ✅ Good Practice (After)
```typescript
// Upsert with stable key
await prisma.product.upsert({
  where: { slug: 'starlink-kit' },  // Unique, stable identifier
  update: {},                        // Don't touch if exists
  create: {
    slug: 'starlink-kit',
    name: 'Starlink Kit',
    price: 65000,
  },
});
```

**Benefits:**
- Safe to re-run
- Won't create duplicates
- Won't overwrite admin edits
- Idempotent operation

## Seed Data Philosophy

### Purpose

Seeds are for **bootstrapping empty databases**, not managing production data.

```
✅ DO use seeds for:
   - Initial dev environment setup
   - Staging environment reset
   - Testing data generation
   - Demo/example data

❌ DON'T use seeds for:
   - Production data management
   - Content updates
   - Price changes
   - Product catalog maintenance
```

### Lifecycle

```
Fresh Database → Run Seeds → Develop/Test → Deploy to Staging
                                                    ↓
                                            Deploy to Production
                                                    ↓
                                            NEVER run seeds again
                                                    ↓
                                        All changes via Admin UI
```

## Implementation Guidelines

### 1. Always Use Upsert

```typescript
// ✅ GOOD
await prisma.product.upsert({
  where: { slug: 'unique-slug' },
  update: {},
  create: { /* data */ },
});

// ❌ BAD
await prisma.product.create({ /* data */ });
```

### 2. Use Stable, Meaningful Keys

```typescript
// ✅ GOOD - Slug is stable and meaningful
where: { slug: 'starlink-standard-kit' }

// ✅ GOOD - Custom stable ID
where: { id: 'banner-starlink-gen3' }

// ❌ BAD - Auto-generated UUIDs
where: { id: uuid() }  // Changes every run!
```

### 3. Don't Update Existing Data

```typescript
// ✅ GOOD - Empty update means "don't touch if exists"
await prisma.product.upsert({
  where: { slug: 'product' },
  update: {},  // ← Important!
  create: { /* ... */ },
});

// ❌ BAD - Overwrites admin changes
await prisma.product.upsert({
  where: { slug: 'product' },
  update: { price: 100 },  // ← Will overwrite!
  create: { /* ... */ },
});
```

### 4. Document Clearly

```typescript
// ─── Products — Starlink ────────────────────────────────────────
// NOTE: These are bootstrap data only. Production products
// are managed via admin dashboard. Re-running seeds will NOT
// overwrite existing products due to upsert logic.
```

### 5. Add Warning Comments

```typescript
/**
 * SEED DATA - DEV/STAGING BOOTSTRAP ONLY
 * 
 * This seed file is designed to populate a fresh database with
 * initial data for development and staging environments.
 * 
 * IMPORTANT:
 * - Safe to re-run (uses upsert, won't create duplicates)
 * - Won't overwrite existing data (empty update clause)
 * - NEVER run in production after initial deployment
 * - Production data managed via Admin UI only
 */
```

## Production Deployment Workflow

### Initial Deployment

```bash
# 1. Deploy database schema
npx prisma migrate deploy

# 2. Run seeds ONCE to bootstrap
npx prisma db seed

# 3. Never run seeds again in production
```

### Subsequent Updates

```bash
# ✅ Schema changes
npx prisma migrate deploy

# ❌ Never re-run seeds
# npx prisma db seed  # DON'T DO THIS!
```

## Environment-Specific Seeds

### Option 1: Environment Check

```typescript
async function main() {
  const env = process.env.NODE_ENV;
  
  if (env === 'production') {
    console.log('⚠️  Seeds are disabled in production');
    return;
  }
  
  // ... seed logic
}
```

### Option 2: Separate Seed Files

```
prisma/
├── seed.ts           # Dev/staging seeds
├── seed.prod.ts      # Production-safe seeds (minimal)
└── seed.test.ts      # Test data
```

## Monitoring Seed Safety

### Add Logging

```typescript
const prod1 = await prisma.product.upsert({
  where: { slug: 'starlink-standard-kit' },
  update: {},
  create: {
    // ... data
  },
});

if (prod1.createdAt < prod1.updatedAt) {
  console.log(`   ↪ Product "${prod1.name}" already existed, skipped`);
} else {
  console.log(`   ✓ Created product "${prod1.name}"`);
}
```

### Count Operations

```typescript
let created = 0;
let skipped = 0;

// ... upsert operations

console.log(`\n📊 Summary:`);
console.log(`   Created: ${created}`);
console.log(`   Skipped: ${skipped}`);
```

## Common Pitfalls

### ❌ Using Create Instead of Upsert

```typescript
// DON'T
await prisma.product.create({
  name: 'Product',
  slug: 'product',
});
// Error on second run: Unique constraint violation
```

### ❌ Updating in Upsert

```typescript
// DON'T
await prisma.product.upsert({
  where: { slug: 'product' },
  update: { price: 100 },  // ← Overwrites admin changes!
  create: { /* ... */ },
});
```

### ❌ Non-Stable Keys

```typescript
// DON'T
await prisma.product.upsert({
  where: { id: generateUUID() },  // ← Changes every run!
  update: {},
  create: { /* ... */ },
});
```

### ❌ Cascade Deletes in Seeds

```typescript
// DON'T
await prisma.product.deleteMany({});
await prisma.product.createMany({
  data: products,
});
// Deletes ALL products including admin-created ones!
```

## Testing Seed Safety

### Test Idempotency

```bash
# Run seeds twice
npm run db:seed
npm run db:seed

# Check for duplicates
psql $DATABASE_URL -c "
  SELECT name, COUNT(*) 
  FROM \"Product\" 
  GROUP BY name 
  HAVING COUNT(*) > 1;
"
```

### Test Admin Edit Preservation

```bash
# 1. Run seeds
npm run db:seed

# 2. Manually edit a product price via admin UI
# 3. Run seeds again
npm run db:seed

# 4. Verify price didn't change back
psql $DATABASE_URL -c "
  SELECT name, price 
  FROM \"Product\" 
  WHERE slug = 'starlink-standard-kit';
"
```

## Documentation Requirements

### In Code (seed.ts)

```typescript
/**
 * DATABASE SEED FILE
 * 
 * Purpose: Bootstrap fresh databases with initial data
 * Environment: Development and Staging only
 * Safety: Uses upsert - safe to re-run, won't create duplicates
 * 
 * PRODUCTION WARNING:
 * - Run ONCE during initial deployment only
 * - After that, all data managed via Admin UI
 * - Re-running in production is SAFE but UNNECESSARY
 * 
 * What's Seeded:
 * - Roles & Permissions
 * - Admin user
 * - Store modules (Starlink, CCTV)
 * - Categories
 * - Sample products
 * - Installation services
 * - Homepage banners
 */
```

### In README.md

```markdown
## Database Seeding

Seeds are for bootstrapping empty databases during development.

**Development:**
```bash
npm run db:seed  # Safe to run multiple times
```

**Production:**
```bash
# Run ONCE after initial deployment
npm run db:seed

# After that, manage data via Admin UI
# DO NOT re-run seeds
```

**Note:** Seeds use `upsert` with stable keys, so re-running won't create duplicates or overwrite admin edits.
```

## Best Practices Checklist

When adding new seed data:

- [ ] Use `upsert` instead of `create`
- [ ] Provide stable, unique `where` clause
- [ ] Keep `update: {}` empty to preserve edits
- [ ] Use meaningful, stable IDs (slugs or custom IDs)
- [ ] Add descriptive comments
- [ ] Log what was created vs skipped
- [ ] Test idempotency (run twice)
- [ ] Document in code and README
- [ ] Consider environment checks
- [ ] Never seed sensitive data (passwords, tokens, etc.)

## Summary

✅ **Seeds are for bootstrapping, not maintenance**  
✅ **Always use upsert with stable keys**  
✅ **Never update existing data in seeds**  
✅ **Safe to re-run, but unnecessary in production**  
✅ **All production changes via Admin UI**  
✅ **Document clearly and warn about production**  

## Our Implementation Status

✅ All seed operations use `upsert`  
✅ Stable keys used (slugs and custom IDs)  
✅ Empty `update: {}` preserves admin edits  
✅ Clear comments in seed file  
✅ Safe to re-run without duplicates  
⚠️ Should add environment check for production  
⚠️ Should add more detailed logging  
⚠️ Should document in README  

## Recommended Next Steps

1. Add environment check to seed file
2. Enhance logging (created vs skipped)
3. Add warning banner in seed output
4. Document in project README
5. Add npm script comments
6. Create staging/production seed strategy
7. Train team on seed best practices
