-- AlterTable: 기존 데이터 호환을 위해 DEFAULT '' 로 추가 후 제약 유지
ALTER TABLE "steam_accounts"
  ADD COLUMN "email"          VARCHAR(320)  NOT NULL DEFAULT '',
  ADD COLUMN "email_password" TEXT          NOT NULL DEFAULT '',
  ADD COLUMN "email_site_url" VARCHAR(2048) NOT NULL DEFAULT '';

-- 기본값 제거 (신규 INSERT 시 반드시 값 전달 강제)
ALTER TABLE "steam_accounts"
  ALTER COLUMN "email"          DROP DEFAULT,
  ALTER COLUMN "email_password" DROP DEFAULT,
  ALTER COLUMN "email_site_url" DROP DEFAULT;
