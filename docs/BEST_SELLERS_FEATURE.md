# Best Sellers Feature

## Overview
Added manual best seller management to allow admins to mark specific products as best sellers. These products are displayed prominently on the homepage.

## Changes Made

### Backend

1. **Database Schema** (`prisma/schema.prisma`)
   - Added `isBestSeller Boolean @default(false)` field to Product model
   - Added index on `isBestSeller` for query performance
   - Migration created: `20260810071322_add_best_seller_flag`

2. **DTOs**
   - `create-product.dto.ts`: Added `isBestSeller?: boolean` field
   - `update-product.dto.ts`: Inherits from CreateProductDto (no changes needed)
   - `query-product.dto.ts`: Added `bestSeller?: string` query param

3. **Service** (`products.service.ts`)
   - `findAll()`: Added support for `bestSeller=true` filter
   - `findAllAdmin()`: Added support for `bestSeller=true` filter

### Frontend

1. **Types** (`types/index.ts`)
   - Added `isBestSeller?: boolean` to Product interface

2. **Home Page** (`pages/Home.tsx`)
   - Updated best sellers query from `featured=true` to `bestSeller=true`
   - Now fetches actual best seller products instead of featured products

3. **Admin Products Page** (`pages/admin/AdminProducts.tsx`)
   - Added `isBestSeller` to form state and reset logic
   - Added "Best Seller" checkbox in product form (next to Featured)
   - Added orange "Best Seller" badge in product list
   - Added trending-up icon toggle button (like the star for featured)
   - Added `toggleBestSeller` mutation

## How to Use

### For Admins:

1. **Mark Product as Best Seller (Quick Toggle)**
   - Go to Admin → Products
   - Click the trending-up icon (📈) next to any product
   - Orange background = Best Seller
   - Gray background = Not a Best Seller

2. **Mark Product as Best Seller (Form)**
   - Edit or create a product
   - Check the "Best Seller" checkbox
   - Save the product

### For Customers:

- Best seller products appear in the "Best Sellers" section on the homepage
- Limited to 4 products in the carousel
- Only active, in-stock best sellers are shown

## Notes

- Best sellers are manually curated by admins (not automatic based on sales)
- A product can be both Featured AND Best Seller
- Products marked as best sellers must also be active and in stock to appear on homepage
- Uses the existing product filtering system for consistency
