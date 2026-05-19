-- 알림톡 발송 본문 저장 (발송 이력 내용 표시용)
ALTER TABLE "delivery_logs" ADD COLUMN "message" TEXT;
