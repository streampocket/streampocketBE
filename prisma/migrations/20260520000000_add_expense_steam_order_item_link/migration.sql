-- 비용(expense) ↔ 스팀 주문(steam_order_item) 1:1 연결
ALTER TABLE "expenses" ADD COLUMN "steam_order_item_id" UUID;

-- CreateIndex (Unique)
CREATE UNIQUE INDEX "expenses_steam_order_item_id_key" ON "expenses"("steam_order_item_id");

-- AddForeignKey
ALTER TABLE "expenses"
  ADD CONSTRAINT "expenses_steam_order_item_id_fkey"
  FOREIGN KEY ("steam_order_item_id") REFERENCES "steam_order_items"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
