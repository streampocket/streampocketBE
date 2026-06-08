-- 주문 멀티스토어 식별 — steam_order_items 에 store / game_id 가산.
-- 전부 가산: 기존 컬럼/데이터 무영향. store 는 기본값 streampocket 으로 기존 행 자동 채움.

-- AlterTable
ALTER TABLE "steam_order_items" ADD COLUMN "store" "Store" NOT NULL DEFAULT 'streampocket';
ALTER TABLE "steam_order_items" ADD COLUMN "game_id" UUID;

-- CreateIndex
CREATE INDEX "steam_order_items_store_fulfillment_status_created_at_idx" ON "steam_order_items"("store", "fulfillment_status", "created_at");

-- AddForeignKey
ALTER TABLE "steam_order_items" ADD CONSTRAINT "steam_order_items_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "steam_games"("id") ON DELETE SET NULL ON UPDATE CASCADE;
