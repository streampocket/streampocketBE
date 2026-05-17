-- AlterTable: 주문에 발송완료 시각 추가 (관리자/시스템의 실제 완료 처리 시점 — 구매자 구매확정과 분리)
ALTER TABLE "steam_order_items" ADD COLUMN "completed_at" TIMESTAMPTZ(6);

-- 백필: 기존 완료/구매확정 주문은 이미 완료된 주문이므로 updated_at으로 채워
-- 진행사항 페이지에서 "진행중"으로 회귀하지 않도록 함
UPDATE "steam_order_items"
SET "completed_at" = "updated_at"
WHERE "fulfillment_status" IN ('completed', 'purchase_decided')
  AND "completed_at" IS NULL;
