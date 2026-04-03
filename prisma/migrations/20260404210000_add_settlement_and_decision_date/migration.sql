-- AlterTable: SteamOrderItem에 정산금/구매확정일 추가
ALTER TABLE "steam_order_items" ADD COLUMN "settlement_amount" INTEGER;
ALTER TABLE "steam_order_items" ADD COLUMN "decision_date" TIMESTAMPTZ;

-- CreateIndex
CREATE INDEX "steam_order_items_decision_date_idx" ON "steam_order_items"("decision_date");

-- AlterTable: SystemSettings에서 commission_rate 제거
ALTER TABLE "system_settings" DROP COLUMN "commission_rate";
