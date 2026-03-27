/*
  Warnings:

  - You are about to drop the column `code_id` on the `steam_order_items` table. All the data in the column will be lost.
  - You are about to drop the `steam_codes` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('available', 'reserved', 'sent', 'disabled');

-- DropForeignKey
ALTER TABLE "steam_codes" DROP CONSTRAINT "steam_codes_product_id_fkey";

-- DropForeignKey
ALTER TABLE "steam_order_items" DROP CONSTRAINT "steam_order_items_code_id_fkey";

-- AlterTable
ALTER TABLE "steam_order_items" DROP COLUMN "code_id",
ADD COLUMN     "account_id" UUID;

-- DropTable
DROP TABLE "steam_codes";

-- DropEnum
DROP TYPE "CodeStatus";

-- CreateTable
CREATE TABLE "steam_accounts" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "status" "AccountStatus" NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "steam_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_templates" (
    "id" UUID NOT NULL,
    "subject" TEXT NOT NULL,
    "body_template" TEXT NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "steam_accounts_product_id_status_created_at_idx" ON "steam_accounts"("product_id", "status", "created_at");

-- AddForeignKey
ALTER TABLE "steam_accounts" ADD CONSTRAINT "steam_accounts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "steam_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "steam_order_items" ADD CONSTRAINT "steam_order_items_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "steam_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
