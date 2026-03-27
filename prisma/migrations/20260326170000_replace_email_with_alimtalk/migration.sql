-- AlterEnum
CREATE TYPE "DeliveryChannel" AS ENUM ('alimtalk');

-- AlterEnum
CREATE TYPE "DeliveryLogStatus" AS ENUM ('queued', 'sent', 'failed');

-- AlterTable
ALTER TABLE "steam_order_items"
  DROP COLUMN IF EXISTS "buyer_email",
  ADD COLUMN "receiver_phone_number" VARCHAR(30),
  ADD COLUMN "receiver_name" VARCHAR(100);

-- CreateTable
CREATE TABLE "delivery_logs" (
  "id" UUID NOT NULL,
  "order_item_id" UUID NOT NULL,
  "channel" "DeliveryChannel" NOT NULL,
  "recipient" VARCHAR(100) NOT NULL,
  "status" "DeliveryLogStatus" NOT NULL DEFAULT 'queued',
  "error_message" TEXT,
  "provider_message_id" VARCHAR(100),
  "sent_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "delivery_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alimtalk_settings" (
  "id" UUID NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "message_template" TEXT NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "alimtalk_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "delivery_logs_order_item_id_created_at_idx" ON "delivery_logs"("order_item_id", "created_at");

-- AddForeignKey
ALTER TABLE "delivery_logs"
  ADD CONSTRAINT "delivery_logs_order_item_id_fkey"
  FOREIGN KEY ("order_item_id") REFERENCES "steam_order_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- DropTable
DROP TABLE IF EXISTS "email_logs";

-- DropTable
DROP TABLE IF EXISTS "email_templates";

-- DropEnum
DROP TYPE IF EXISTS "EmailLogStatus";
