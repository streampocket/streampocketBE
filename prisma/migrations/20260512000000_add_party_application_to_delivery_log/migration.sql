-- DropForeignKey
ALTER TABLE "delivery_logs" DROP CONSTRAINT "delivery_logs_order_item_id_fkey";

-- AlterTable
ALTER TABLE "delivery_logs" ALTER COLUMN "order_item_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "delivery_logs" ADD COLUMN "party_application_id" UUID;

-- CreateIndex
CREATE INDEX "delivery_logs_party_application_id_created_at_idx" ON "delivery_logs"("party_application_id", "created_at");

-- AddForeignKey
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "steam_order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_party_application_id_fkey" FOREIGN KEY ("party_application_id") REFERENCES "party_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;
