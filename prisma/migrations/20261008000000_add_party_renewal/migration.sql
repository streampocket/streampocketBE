-- 파티 재구매(기간 연장) + 재구매 할인 이벤트 설정.
-- 재구매는 party_applications에 행을 더하지 않고 party_renewals에 따로 둔다 — 신청을 읽는 곳이 많아
-- 재구매 행이 섞이면 그곳마다 걸러내야 하기 때문이다. 승인하면 원 신청의 expires_at만 늘어난다.
-- 기존 데이터 변환 없음: 새 표·nullable 컬럼·기본값 있는 컬럼만 추가한다.

-- 재구매 알림톡 발송 이력 (원 신청 이력에 섞이지 않게 party_application_id는 비워 둔다)
ALTER TABLE "delivery_logs" ADD COLUMN     "party_renewal_id" UUID;

-- 재구매 리뷰: 원 신청 리뷰는 application_id만, 재구매 리뷰는 renewal_id만 채운다.
-- 기존 리뷰는 모두 application_id가 있으므로 NOT NULL 해제는 데이터에 영향이 없다.
ALTER TABLE "own_reviews" ADD COLUMN     "renewal_id" UUID,
ALTER COLUMN "application_id" DROP NOT NULL;

-- 재구매 주문 → 재구매 건 연결 (반품 시 파티원 제거 대신 그 재구매 기간만 되돌리는 근거)
ALTER TABLE "steam_order_items" ADD COLUMN     "party_renewal_id" UUID;

-- 재구매 할인 이벤트 설정 (기본 꺼짐)
ALTER TABLE "system_settings" ADD COLUMN     "renewal_discount_amount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "renewal_discount_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "renewal_discount_end_date" DATE,
ADD COLUMN     "renewal_discount_start_date" DATE;

-- CreateTable
CREATE TABLE "party_renewals" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "status" "PartyApplicationStatus" NOT NULL DEFAULT 'pending',
    "price" INTEGER NOT NULL,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "fee" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "used_point" INTEGER NOT NULL DEFAULT 0,
    "extended_from" TIMESTAMPTZ(6),
    "extended_to" TIMESTAMPTZ(6),
    "decided_at" TIMESTAMPTZ(6),
    "returned_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "party_renewals_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "party_renewals_application_id_status_idx" ON "party_renewals"("application_id", "status");

-- CreateIndex
CREATE INDEX "party_renewals_status_created_at_idx" ON "party_renewals"("status", "created_at");

-- CreateIndex
CREATE INDEX "delivery_logs_party_renewal_id_created_at_idx" ON "delivery_logs"("party_renewal_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "own_reviews_renewal_id_key" ON "own_reviews"("renewal_id");

-- CreateIndex
CREATE INDEX "steam_order_items_party_renewal_id_idx" ON "steam_order_items"("party_renewal_id");

-- AddForeignKey
ALTER TABLE "steam_order_items" ADD CONSTRAINT "steam_order_items_party_renewal_id_fkey" FOREIGN KEY ("party_renewal_id") REFERENCES "party_renewals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_logs" ADD CONSTRAINT "delivery_logs_party_renewal_id_fkey" FOREIGN KEY ("party_renewal_id") REFERENCES "party_renewals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_renewals" ADD CONSTRAINT "party_renewals_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "party_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "own_reviews" ADD CONSTRAINT "own_reviews_renewal_id_fkey" FOREIGN KEY ("renewal_id") REFERENCES "party_renewals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 리뷰는 원 신청·재구매 중 정확히 하나에 속한다 (Prisma 스키마로는 표현할 수 없어 SQL로 둔다)
ALTER TABLE "own_reviews" ADD CONSTRAINT "own_reviews_target_exactly_one_chk"
  CHECK (("application_id" IS NULL) <> ("renewal_id" IS NULL));
