# Database & Seed Data

## Overview

- **Database:** PostgreSQL
- **ORM:** Prisma
- **Migrations:** Version-controlled SQL files

## Schema Highlights

### Core Tables
- **User** - Customer and admin accounts
- **Product** - Product catalog
- **Category** - Product categorization
- **StoreModule** - Starlink, CCTV, etc.
- **Order** - Customer orders
- **Cart** - Shopping cart items
- **PromoBanner** - Homepage banners (NEW)

### Supporting Tables
- Inventory, Warehouse
- Payment, Shipping
- Review, Coupon
- InstallationService, SupportTicket
- And more...

## Migrations

### Running Migrations

**Development:**
```bash
npx prisma migrate dev --name description
```

**Production:**
```bash
npx prisma migrate deploy
```

### Current Migrations
1. `20260719125735_add_store_module` - Initial schema
2. `20260807154521_add_promo_banner` - PromoBanner table + STRIPE enum

## Seed Data

### Purpose
Bootstrap the application with initial data for development and testing.

### What Gets Seeded
1. **Roles & Permissions** - Admin, Customer roles
2. **Admin User** - admin@movec.co.ke
3. **Warehouses** - Main warehouse
4. **Modules** - Starlink, CCTV
5. **Categories** - Starlink Kits, IP Cameras, etc.
6. **Brands** - Starlink, Hikvision, Dahua
7. **Products** - 8 sample products
8. **Inventory** - Stock levels
9. **Promo Banners** - 3 homepage banners

### Running Seed

```bash
cd backend
npx prisma db seed
```

### Seed Best Practices

**✅ DO:**
- Use `upsert` instead of `create`
- Key on unique identifiers (slug, SKU, email)
- Document as "run once on fresh DB"
- Make idempotent (safe to re-run)

**❌ DON'T:**
- Use blind `create` (causes duplicates)
- Overwrite production data
- Include sensitive credentials
- Seed large datasets

### Upsert Pattern

```typescript
await prisma.product.upsert({
  where: { sku: 'STARLINK-STD-KIT' },
  update: {},  // Don't overwrite on re-run
  create: {
    name: 'Starlink Standard Kit',
    sku: 'STARLINK-STD-KIT',
    // ... other fields
  },
});
```

### Admin Credentials

After seeding:
- **Email:** admin@movec.co.ke
- **Password:** admin123

⚠️ **Change immediately in production!**

## Database Management

### View Data
```bash
npx prisma studio
```
Opens GUI at `http://localhost:5555`

### Reset Database
```bash
npx prisma migrate reset
```
⚠️ Deletes all data!

### Generate Prisma Client
```bash
npx prisma generate
```
Run after schema changes.

## Schema Modifications

### Adding a Table

1. Edit `schema.prisma`:
```prisma
model NewTable {
  id        String   @id @default(cuid())
  name      String
  createdAt DateTime @default(now())
}
```

2. Create migration:
```bash
npx prisma migrate dev --name add_new_table
```

3. Update seed if needed

### Adding a Column

1. Edit model in `schema.prisma`
2. Create migration
3. Handle existing data if needed

### Relationships

```prisma
model Product {
  id       String    @id
  brand    Brand?    @relation(fields: [brandId], references: [id])
  brandId  String?
}

model Brand {
  id       String    @id
  products Product[]
}
```

## Troubleshooting

### Migration Drift
**Error:** "Migration history differs from database schema"

**Solution:**
```bash
# Development
npx prisma migrate reset

# Production (careful!)
npx prisma migrate resolve --rolled-back <migration>
npx prisma migrate deploy
```

### Seed Fails
**Error:** Unique constraint violation

**Solution:**
- Check for existing data
- Verify upsert keys
- Reset database if in development

### Connection Issues
**Error:** "Can't reach database server"

**Solution:**
- Verify DATABASE_URL in .env
- Check PostgreSQL is running
- Verify network/firewall rules

### Schema Out of Sync
**Error:** "Type does not exist in database"

**Solution:**
```bash
npx prisma generate
npx prisma db push  # Development only
```

## Production Considerations

### Backups
- Set up automated backups
- Test restore procedure
- Store backups securely

### Scaling
- Add indexes for frequently queried columns
- Monitor slow queries
- Consider read replicas for high traffic

### Monitoring
- Track database CPU/memory
- Monitor connection pool
- Set up alerts for errors
