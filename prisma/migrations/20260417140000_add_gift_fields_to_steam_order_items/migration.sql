-- AlterTable
ALTER TABLE "steam_order_items" ADD COLUMN "friend_link1" VARCHAR(500);
ALTER TABLE "steam_order_items" ADD COLUMN "friend_link2" VARCHAR(500);
ALTER TABLE "steam_order_items" ADD COLUMN "gift_completed_at" TIMESTAMPTZ(6);
