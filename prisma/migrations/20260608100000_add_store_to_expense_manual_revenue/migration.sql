-- 비용/수동매출 멀티스토어 — store(nullable, null=공통/전사) 가산.
-- 전부 가산: 기존 컬럼/데이터 무영향. 기존 행은 NULL 로 생성 후 다음 백필 마이그레이션에서 streampocket 으로 채움.

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN "store" "Store";
ALTER TABLE "manual_revenues" ADD COLUMN "store" "Store";

-- CreateIndex
CREATE INDEX "expenses_store_date_idx" ON "expenses"("store", "date");
CREATE INDEX "manual_revenues_store_date_idx" ON "manual_revenues"("store", "date");
