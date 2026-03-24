-- CreateEnum
CREATE TYPE "ProductStatus" AS ENUM ('draft', 'active', 'inactive');

-- CreateEnum
CREATE TYPE "CodeStatus" AS ENUM ('available', 'reserved', 'sent', 'disabled');

-- CreateEnum
CREATE TYPE "FulfillmentStatus" AS ENUM ('pending', 'completed', 'manual_review', 'failed');

-- CreateEnum
CREATE TYPE "EmailLogStatus" AS ENUM ('queued', 'sent', 'failed');

-- CreateTable
CREATE TABLE "admins" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "password" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "steam_products" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "naver_product_id" VARCHAR(100) NOT NULL,
    "email_option_name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "caution" TEXT,
    "event" TEXT,
    "status" "ProductStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "steam_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "steam_codes" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "code_value" TEXT NOT NULL,
    "status" "CodeStatus" NOT NULL DEFAULT 'available',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "steam_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "steam_order_items" (
    "id" UUID NOT NULL,
    "product_order_id" VARCHAR(100) NOT NULL,
    "naver_order_id" VARCHAR(100) NOT NULL,
    "product_id" UUID,
    "code_id" UUID,
    "product_name" VARCHAR(255) NOT NULL,
    "buyer_email" VARCHAR(320),
    "unit_price" INTEGER NOT NULL,
    "fulfillment_status" "FulfillmentStatus" NOT NULL DEFAULT 'pending',
    "error_message" TEXT,
    "paid_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "steam_order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_logs" (
    "id" UUID NOT NULL,
    "order_item_id" UUID NOT NULL,
    "recipient_email" VARCHAR(320) NOT NULL,
    "status" "EmailLogStatus" NOT NULL DEFAULT 'queued',
    "error_message" TEXT,
    "sent_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE UNIQUE INDEX "steam_products_naver_product_id_key" ON "steam_products"("naver_product_id");

-- CreateIndex
CREATE INDEX "steam_codes_product_id_status_created_at_idx" ON "steam_codes"("product_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "steam_order_items_product_order_id_key" ON "steam_order_items"("product_order_id");

-- CreateIndex
CREATE INDEX "steam_order_items_fulfillment_status_created_at_idx" ON "steam_order_items"("fulfillment_status", "created_at");

-- CreateIndex
CREATE INDEX "steam_order_items_naver_order_id_idx" ON "steam_order_items"("naver_order_id");

-- CreateIndex
CREATE INDEX "email_logs_order_item_id_created_at_idx" ON "email_logs"("order_item_id", "created_at");

-- AddForeignKey
ALTER TABLE "steam_codes" ADD CONSTRAINT "steam_codes_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "steam_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "steam_order_items" ADD CONSTRAINT "steam_order_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "steam_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "steam_order_items" ADD CONSTRAINT "steam_order_items_code_id_fkey" FOREIGN KEY ("code_id") REFERENCES "steam_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_logs" ADD CONSTRAINT "email_logs_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "steam_order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
