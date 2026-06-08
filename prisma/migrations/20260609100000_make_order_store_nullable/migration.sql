-- 수동주문 스토어 중립화 — steam_order_items.store 를 nullable 로 전환.
-- 수동주문(source='manual')은 store=NULL(스토어 무귀속) → 매출 집계에서 "전체"에만 포함, 스토어별 보기엔 제외.
-- 네이버 주문은 종전대로 store 값(streampocket/pokemon_steam) 유지. 기본값 streampocket 은 네이버 안전망으로 남겨둠.

ALTER TABLE "steam_order_items" ALTER COLUMN "store" DROP NOT NULL;

UPDATE "steam_order_items" SET "store" = NULL WHERE source = 'manual';
