-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'CASH_ON_DELIVERY';

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "isDeposit" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "PaymentSettings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "codEnabled" BOOLEAN NOT NULL DEFAULT true,
    "codDepositThreshold" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "codDepositPercentage" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSettings_pkey" PRIMARY KEY ("id")
);
