-- 기존 steam_products → steam_games + store_listings(store=streampocket) 백필.
-- 멱등: ON CONFLICT / WHERE IS NULL 가드로 재실행해도 결과 동일.
-- 핵심: steam_games.id = 기존 steam_products.id 재사용 → 계정/주문 재배선이 단순 복사가 된다.

-- 1) 게임 마스터 생성. product_type 은 상품명에서 파싱
--    (배틀그라운드→BG 우선, 끝 ' NA'→NA, 끝 ' AA'→AA, 그 외→NA 기본).
--    현재 운영 상품은 detectProductType 으로 이미 정상 파싱되므로 ELSE 분기는 휴면/초안 상품용 안전망.
INSERT INTO "steam_games" ("id", "name", "product_type", "created_at", "updated_at")
SELECT
  p."id",
  p."name",
  CASE
    WHEN p."name" LIKE '%배틀그라운드%' THEN 'BG'::"SteamProductType"
    WHEN TRIM(p."name") ~* ' NA$'       THEN 'NA'::"SteamProductType"
    WHEN TRIM(p."name") ~* ' AA$'       THEN 'AA'::"SteamProductType"
    ELSE 'NA'::"SteamProductType"
  END,
  p."created_at",
  p."updated_at"
FROM "steam_products" p
ON CONFLICT ("id") DO NOTHING;

-- 2) 스토어별 리스팅 생성. 기존 상품 = streampocket 리스팅 (game_id = product.id).
INSERT INTO "store_listings" (
  "id", "store", "game_id", "naver_product_id",
  "price", "discount_price_pc", "discount_price_mobile", "status",
  "created_at", "updated_at"
)
SELECT
  gen_random_uuid(),
  'streampocket'::"Store",
  p."id",
  p."naver_product_id",
  p."price",
  p."discount_price_pc",
  p."discount_price_mobile",
  p."status",
  p."created_at",
  p."updated_at"
FROM "steam_products" p
ON CONFLICT ("naver_product_id") DO NOTHING;

-- 3) 계정 재고를 게임에 연결 (game_id = product_id, id 재사용이라 단순 복사).
UPDATE "steam_accounts"
SET "game_id" = "product_id"
WHERE "game_id" IS NULL AND "product_id" IS NOT NULL;
