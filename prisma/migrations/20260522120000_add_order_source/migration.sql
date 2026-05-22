-- 주문 출처 구분 (naver: 스마트스토어 자동 감지 / manual: 관리자 수동 등록)
-- CreateEnum
CREATE TYPE "OrderSource" AS ENUM ('naver', 'manual');

-- AlterTable: 기존 행은 모두 default 'naver'로 채워짐
ALTER TABLE "steam_order_items" ADD COLUMN "source" "OrderSource" NOT NULL DEFAULT 'naver';

-- CreateIndex: 출처별 목록/카운트 조회 최적화
CREATE INDEX "steam_order_items_source_fulfillment_status_created_at_idx" ON "steam_order_items"("source", "fulfillment_status", "created_at");
