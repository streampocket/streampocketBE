-- 이미 confirmed 파티원이 있는데도 own_products.started_at이 NULL인 파티를,
-- 그 파티의 가장 빠른 confirmed party_applications.started_at 값으로 백필한다.
-- 첫 confirmed 시점을 파티 시작 시각으로 보는 정책(adminApproveApplication과 일치).

UPDATE "own_products" AS p
SET "started_at" = sub.first_started_at
FROM (
  SELECT "product_id", MIN("started_at") AS first_started_at
  FROM "party_applications"
  WHERE "status" = 'confirmed' AND "started_at" IS NOT NULL
  GROUP BY "product_id"
) AS sub
WHERE p."id" = sub."product_id"
  AND p."started_at" IS NULL;
