-- 1) leader_name 컬럼 추가 (일단 NULL 허용)
ALTER TABLE "own_products" ADD COLUMN "leader_name" VARCHAR(100);

-- 2) 기존 행은 user.name(최대 100자)으로 채움
UPDATE "own_products" op
SET "leader_name" = LEFT(u."name", 100)
FROM "users" u
WHERE op."user_id" = u."id";

-- 3) 안전장치: 여전히 NULL인 행이 있으면 기본값으로 보정 (참여자 보존을 위해 행 자체는 절대 삭제하지 않음)
UPDATE "own_products" SET "leader_name" = '미지정' WHERE "leader_name" IS NULL;

-- 4) NOT NULL 전환
ALTER TABLE "own_products" ALTER COLUMN "leader_name" SET NOT NULL;

-- 5) FK / 인덱스 / 컬럼 제거
ALTER TABLE "own_products" DROP CONSTRAINT IF EXISTS "own_products_user_id_fkey";
DROP INDEX IF EXISTS "own_products_user_id_idx";
ALTER TABLE "own_products" DROP COLUMN "user_id";

-- 6) 파트너 테이블 제거
DROP TABLE IF EXISTS "partners";

-- 7) enum 정리
DROP TYPE IF EXISTS "PartnerStatus";
