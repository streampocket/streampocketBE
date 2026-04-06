-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateTable
CREATE TABLE "partners" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "bank_name" VARCHAR(50) NOT NULL,
    "bank_account" VARCHAR(50) NOT NULL,
    "status" "PartnerStatus" NOT NULL DEFAULT 'pending',
    "rejected_at" TIMESTAMPTZ(6),
    "rejection_note" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_user_id_key" ON "partners"("user_id");

-- CreateIndex
CREATE INDEX "partners_status_created_at_idx" ON "partners"("status", "created_at");

-- AddForeignKey
ALTER TABLE "partners" ADD CONSTRAINT "partners_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
