-- CreateEnum
CREATE TYPE "PointTransactionType" AS ENUM ('review_reward', 'review_revoke', 'party_use', 'party_refund');

-- AlterTable
-- 보유 포인트 잔액. 기존 회원은 0으로 시작한다.
ALTER TABLE "users" ADD COLUMN "point_balance" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
-- 신청 시점에 차감한 포인트 스냅샷. 기존 신청은 전부 0(포인트 도입 전).
ALTER TABLE "party_applications" ADD COLUMN "used_point" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
-- 리뷰 적립 포인트 3구간 (실결제액 기준). 기본값은 schema.prisma의 @default와 일치해야 한다.
ALTER TABLE "system_settings" ADD COLUMN "review_point_tier1_max" INTEGER NOT NULL DEFAULT 7000;
ALTER TABLE "system_settings" ADD COLUMN "review_point_tier2_max" INTEGER NOT NULL DEFAULT 10000;
ALTER TABLE "system_settings" ADD COLUMN "review_point_tier1_point" INTEGER NOT NULL DEFAULT 100;
ALTER TABLE "system_settings" ADD COLUMN "review_point_tier2_point" INTEGER NOT NULL DEFAULT 200;
ALTER TABLE "system_settings" ADD COLUMN "review_point_tier3_point" INTEGER NOT NULL DEFAULT 300;

-- CreateTable
-- 포인트 변동 이력. 잔액의 근거이자 중복 지급·중복 반환을 막는 판정 근거다.
-- review_id / application_id는 원본이 삭제돼도 이력이 남아야 하므로 FK를 걸지 않는다.
CREATE TABLE "point_transactions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "PointTransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "review_id" UUID,
    "application_id" UUID,
    "memo" VARCHAR(200),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "point_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "point_transactions_user_id_created_at_idx" ON "point_transactions"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "point_transactions_review_id_type_idx" ON "point_transactions"("review_id", "type");

-- CreateIndex
CREATE INDEX "point_transactions_application_id_type_idx" ON "point_transactions"("application_id", "type");

-- AddForeignKey
ALTER TABLE "point_transactions" ADD CONSTRAINT "point_transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
