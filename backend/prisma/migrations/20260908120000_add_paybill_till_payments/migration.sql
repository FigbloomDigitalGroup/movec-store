-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'PAYBILL';
ALTER TYPE "PaymentMethod" ADD VALUE 'TILL';

-- AlterTable
ALTER TABLE "PaymentSettings" ADD COLUMN     "paybillEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "PaymentSettings" ADD COLUMN     "paybillNumber" TEXT;
ALTER TABLE "PaymentSettings" ADD COLUMN     "tillEnabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "PaymentSettings" ADD COLUMN     "tillNumber" TEXT;
