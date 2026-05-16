-- AlterTable: 주문에 예상 완료시각 추가 (진행중 단계 카운트다운용)
ALTER TABLE "steam_order_items" ADD COLUMN "estimated_completed_at" TIMESTAMPTZ(6);

-- AlterTable: 시스템 설정에 전역 기본 소요시간(분) 추가
ALTER TABLE "system_settings" ADD COLUMN "default_duration_minutes" INTEGER NOT NULL DEFAULT 60;
