-- AlterEnum: FulfillmentStatus에 purchase_decided 값 추가
ALTER TYPE "FulfillmentStatus" ADD VALUE 'purchase_decided' AFTER 'completed';

-- Backfill: 이미 구매확정된(completed + decisionDate 있음) 주문을 purchase_decided로 일괄 전환
-- ALTER TYPE ADD VALUE는 같은 트랜잭션에서 즉시 사용할 수 없으므로 별도 트랜잭션으로 실행해야 한다.
COMMIT;

UPDATE "steam_order_items"
SET "fulfillment_status" = 'purchase_decided'
WHERE "fulfillment_status" = 'completed'
  AND "decision_date" IS NOT NULL
  AND "returned_at" IS NULL;
