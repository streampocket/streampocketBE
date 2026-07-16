-- 회원 탈퇴: User 소프트 삭제 필드 + 신청/리뷰 익명 보존(SetNull)

-- 1) users 탈퇴 필드
ALTER TABLE "users" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);
ALTER TABLE "users" ADD COLUMN "withdrawal_reason" VARCHAR(500);
ALTER TABLE "users" ADD COLUMN "withdrawn_by_admin" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "users" ADD COLUMN "original_email" VARCHAR(320);
ALTER TABLE "users" ADD COLUMN "original_phone" VARCHAR(20);

CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- 2) party_applications.user_id nullable + ON DELETE SET NULL (탈퇴 회원 완전 삭제 시 신청 내역 익명 보존)
ALTER TABLE "party_applications" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "party_applications" DROP CONSTRAINT "party_applications_user_id_fkey";
ALTER TABLE "party_applications" ADD CONSTRAINT "party_applications_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 3) own_reviews.user_id nullable + ON DELETE SET NULL (리뷰 익명 보존)
ALTER TABLE "own_reviews" ALTER COLUMN "user_id" DROP NOT NULL;
ALTER TABLE "own_reviews" DROP CONSTRAINT "own_reviews_user_id_fkey";
ALTER TABLE "own_reviews" ADD CONSTRAINT "own_reviews_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
