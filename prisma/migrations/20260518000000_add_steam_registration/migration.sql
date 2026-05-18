-- CreateEnum
CREATE TYPE "SteamRegistrationStatus" AS ENUM ('received', 'needs_info', 'completed');

-- CreateEnum
CREATE TYPE "SteamRegistrationMatchStatus" AS ENUM ('unmatched', 'auto_matched', 'manual_matched');

-- CreateTable
CREATE TABLE "steam_registrations" (
    "id" UUID NOT NULL,
    "order_item_id" UUID,
    "steam_id" VARCHAR(255),
    "steam_password" VARCHAR(255),
    "game_name" VARCHAR(255),
    "buyer_name" VARCHAR(100),
    "steam_guard_codes" TEXT,
    "steam_guard_disabled" BOOLEAN,
    "refund_consent" BOOLEAN NOT NULL DEFAULT false,
    "raw_message" TEXT NOT NULL,
    "form_variant" VARCHAR(10),
    "bot_user_key" VARCHAR(255) NOT NULL,
    "missing_fields" TEXT[],
    "match_status" "SteamRegistrationMatchStatus" NOT NULL DEFAULT 'unmatched',
    "status" "SteamRegistrationStatus" NOT NULL DEFAULT 'received',
    "admin_memo" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "steam_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "steam_registrations_status_created_at_idx" ON "steam_registrations"("status", "created_at");

-- CreateIndex
CREATE INDEX "steam_registrations_match_status_created_at_idx" ON "steam_registrations"("match_status", "created_at");

-- CreateIndex
CREATE INDEX "steam_registrations_bot_user_key_created_at_idx" ON "steam_registrations"("bot_user_key", "created_at");

-- AddForeignKey
ALTER TABLE "steam_registrations" ADD CONSTRAINT "steam_registrations_order_item_id_fkey" FOREIGN KEY ("order_item_id") REFERENCES "steam_order_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
