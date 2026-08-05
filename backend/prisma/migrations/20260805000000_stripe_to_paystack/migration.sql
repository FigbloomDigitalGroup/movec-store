-- Rename STRIPE to PAYSTACK in PaymentMethod enum
-- Step 1: Add new value
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'PAYSTACK';

-- Step 2: Migrate any existing STRIPE payments to PAYSTACK
UPDATE "Payment" SET method = 'PAYSTACK' WHERE method = 'STRIPE';

-- Step 3: Remove old value (requires recreating the enum in Postgres)
-- Create a new enum without STRIPE
CREATE TYPE "PaymentMethod_new" AS ENUM ('MPESA', 'PAYSTACK', 'PAYPAL', 'BANK_TRANSFER');

-- Update the column to use new type
ALTER TABLE "Payment" ALTER COLUMN method TYPE "PaymentMethod_new" USING method::text::"PaymentMethod_new";

-- Drop old type and rename new one
DROP TYPE "PaymentMethod";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
