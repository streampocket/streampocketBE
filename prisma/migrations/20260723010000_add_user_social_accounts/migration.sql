-- 휴대폰 번호 기반 계정 통합: 소셜 연동 테이블 신설
-- 순서 중요: 유령 계정 정리 → 테이블 생성 → 기존 소셜 유저 백필

-- 1) 소셜 가입 중단 유령 계정 정리 (전화인증 전 선생성된 temp_ phone 계정 — 로그인 불가 상태)
DELETE FROM "users"
WHERE "phone" LIKE 'temp\_%' ESCAPE '\'
  AND "phone_verified" = false
  AND "deleted_at" IS NULL;

-- 2) 소셜 연동 테이블
CREATE TABLE "user_social_accounts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "provider" "AuthProvider" NOT NULL,
    "provider_id" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_social_accounts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_social_accounts_provider_provider_id_key"
    ON "user_social_accounts"("provider", "provider_id");

CREATE INDEX "user_social_accounts_user_id_idx" ON "user_social_accounts"("user_id");

ALTER TABLE "user_social_accounts"
    ADD CONSTRAINT "user_social_accounts_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 3) 기존 소셜 가입 유저 백필 (탈퇴 회원은 provider_id가 이미 null이라 자동 제외)
INSERT INTO "user_social_accounts" ("user_id", "provider", "provider_id", "created_at")
SELECT "id", "provider", "provider_id", "created_at"
FROM "users"
WHERE "provider" <> 'local'
  AND "provider_id" IS NOT NULL
  AND "deleted_at" IS NULL;
