-- 기존 비용/수동매출 백필 — 포켓몬 미오픈 시점이라 과거 데이터는 전부 스트림포켓 사업분.
-- store IS NULL(기존행)만 채움 → 멱등. 신규 '공통' 항목(null)은 이 마이그레이션 이후 생성되므로 영향 없음.

UPDATE "expenses" SET "store" = 'streampocket'::"Store" WHERE "store" IS NULL;
UPDATE "manual_revenues" SET "store" = 'streampocket'::"Store" WHERE "store" IS NULL;
