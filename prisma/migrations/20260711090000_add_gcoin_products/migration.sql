-- CreateEnum
CREATE TYPE "GcoinProductStatus" AS ENUM ('on_sale', 'hidden', 'sold_out');

-- CreateTable
CREATE TABLE "gcoin_products" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "gcoin_amount" INTEGER NOT NULL,
    "sale_price" INTEGER NOT NULL,
    "list_price" INTEGER,
    "description" TEXT,
    "image_url" VARCHAR(500),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "purchase_count" INTEGER NOT NULL DEFAULT 0,
    "status" "GcoinProductStatus" NOT NULL DEFAULT 'hidden',
    "deleted_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "gcoin_products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gcoin_products_status_sort_order_idx" ON "gcoin_products"("status", "sort_order");
