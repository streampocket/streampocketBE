-- 스팀 친구 코드 (계정번호 accountid) — 친구링크 자동 생성 시 함께 저장
ALTER TABLE "steam_order_items" ADD COLUMN "friend_code" VARCHAR(20);
