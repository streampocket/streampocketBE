-- 주문상황 알림톡 발송 시각 (중복 발송 방지용)
ALTER TABLE "steam_order_items" ADD COLUMN "order_status_alimtalk_sent_at" TIMESTAMPTZ(6);
