-- 네이버 발송처리(dispatch) 완료 시각 — null이면 미발송 상태(진행중 전환/완료 처리 시점에 dispatch 수행)
ALTER TABLE "steam_order_items" ADD COLUMN "naver_dispatched_at" TIMESTAMPTZ(6);

-- 기존 주문 backfill — 배포 전 코드는 주문 인입 즉시 dispatch까지 수행했으므로,
-- 아래 상태에 도달한 네이버 주문은 전부 발송처리 완료 상태다.
-- failed/manual_review 중에서도 알림톡 단계 실패 건은 dispatch가 이미 완료된 상태라 포함.
-- 발주확인/발송처리 단계에서 실패한 건만 제외 → retry로 pending 복귀 시 dispatch가 정상 시도된다.
UPDATE "steam_order_items"
SET "naver_dispatched_at" = "updated_at"
WHERE "source" = 'naver'
  AND (
    "fulfillment_status" IN ('pending', 'in_progress', 'completed', 'purchase_decided', 'returned')
    OR "error_message" LIKE '%알림톡%'
  );
