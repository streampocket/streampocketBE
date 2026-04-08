-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'paid', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('manual', 'pg');

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "amount" INTEGER NOT NULL,
    "method" "PaymentMethod" NOT NULL DEFAULT 'manual',
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "pg_transaction_id" VARCHAR(255),
    "pg_provider" VARCHAR(50),
    "paid_at" TIMESTAMPTZ(6),
    "admin_note" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payments_application_id_idx" ON "payments"("application_id");

-- CreateIndex
CREATE INDEX "payments_status_created_at_idx" ON "payments"("status", "created_at");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "party_applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
