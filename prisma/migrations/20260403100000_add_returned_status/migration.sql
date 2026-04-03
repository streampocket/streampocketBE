-- AlterEnum
ALTER TYPE "FulfillmentStatus" ADD VALUE 'returned';

-- AlterTable
ALTER TABLE "steam_order_items" ADD COLUMN "returned_at" TIMESTAMPTZ(6);
