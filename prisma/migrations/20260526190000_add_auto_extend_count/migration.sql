-- 진행중 주문 예상 완료시각 자동 +10분 연장 횟수 카운터 (주문당 최대 5회)
ALTER TABLE "steam_order_items" ADD COLUMN "auto_extend_count" INTEGER NOT NULL DEFAULT 0;
