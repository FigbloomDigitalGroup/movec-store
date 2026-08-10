-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isBestSeller" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "PromoBanner" ALTER COLUMN "badgeColor" SET DEFAULT '#10b982',
ALTER COLUMN "ctaText" SET DEFAULT 'Shop Now',
ALTER COLUMN "bgColor" SET DEFAULT '#1a2332';

-- CreateIndex
CREATE INDEX "Product_isFeatured_idx" ON "Product"("isFeatured");

-- CreateIndex
CREATE INDEX "Product_isBestSeller_idx" ON "Product"("isBestSeller");
