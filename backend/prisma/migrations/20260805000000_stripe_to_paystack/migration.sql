-- Rename STRIPE to PAYSTACK in PaymentMethod enum
ALTER TYPE "PaymentMethod" RENAME VALUE 'STRIPE' TO 'PAYSTACK';
