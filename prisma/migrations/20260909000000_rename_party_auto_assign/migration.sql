-- 파티 승인 시 알림톡 자동 발송을 제거하고 계정 자동 배정만 남기면서 이름을 바꾼다.
-- 값(true/false)의 의미는 그대로라 데이터 변환이 필요 없다.
ALTER TABLE "system_settings" RENAME COLUMN "party_auto_deliver_enabled" TO "party_auto_assign_enabled";
