-- zqbg 발송상태 자동 조회 사용 여부 — 기본 꺼짐 (기존 주문 포함 전부 false → 잔존 주문의 반복 오류 알림 정지)
ALTER TABLE "steam_order_items" ADD COLUMN "zqbg_auto_check_enabled" BOOLEAN NOT NULL DEFAULT false;
