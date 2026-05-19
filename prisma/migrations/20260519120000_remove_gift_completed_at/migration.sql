-- 선물 접수 완료 기능 제거: gift_completed_at 컬럼 삭제
ALTER TABLE "steam_order_items" DROP COLUMN "gift_completed_at";
