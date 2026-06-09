-- 기존 주문의 game_id 백필.
-- game.id = product.id 재사용(1단계 백필 규칙)이므로 game_id = product_id 단순 복사.
-- 멱등: game_id IS NULL 가드 + steam_games 존재 확인(FK 위반 방지)으로 재실행 안전.
-- store 는 add_order_store_game 의 DEFAULT 로 기존 행이 이미 streampocket 으로 채워짐.

UPDATE "steam_order_items" o
SET "game_id" = o."product_id"
WHERE o."game_id" IS NULL
  AND o."product_id" IS NOT NULL
  AND EXISTS (SELECT 1 FROM "steam_games" g WHERE g."id" = o."product_id");
