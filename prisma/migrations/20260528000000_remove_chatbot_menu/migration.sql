-- 카카오 챗봇 기능 제거 — chatbot_menu_items 테이블 + system_settings.chatbot_welcome_message 컬럼을 삭제한다.
-- steam_registrations 테이블과 SteamRegistrationStatus·SteamRegistrationMatchStatus enum은
-- 자동 친구링크 기능이 자격증명(스팀 ID/PW/가드) 저장소로 계속 사용하므로 유지한다.

DROP TABLE IF EXISTS "chatbot_menu_items";

ALTER TABLE "system_settings" DROP COLUMN IF EXISTS "chatbot_welcome_message";
