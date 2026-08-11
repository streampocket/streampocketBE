-- AlterEnum
ALTER TYPE "AccountStatus" ADD VALUE 'manual';

-- DropIndex
DROP INDEX IF EXISTS "steam_order_items_decision_date_idx";

-- AlterTable
-- 순서 교정(2026-08-10): expenses는 20260404200000(12시간 뒤)에서 생성된다.
-- 이 줄은 원래 여기 있으면 안 되는 줄이라(빈 DB 재생 시 체인 전체가 깨짐) IF EXISTS로 무해화하고,
-- 실제 DROP DEFAULT는 생성 직후(20260404200000 말미)로 옮겼다. 이미 적용된 DB에는 영향 없음.
ALTER TABLE IF EXISTS "expenses" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "steam_accounts" ADD COLUMN     "secondary_email_site_url" VARCHAR(2048);

-- AlterTable
ALTER TABLE "system_settings" ALTER COLUMN "id" DROP DEFAULT;
