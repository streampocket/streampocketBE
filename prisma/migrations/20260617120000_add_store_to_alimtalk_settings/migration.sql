-- 알림톡 설정 멀티스토어 — store(NOT NULL, 스토어당 1레코드) 가산.
-- 기존 단일 전역 레코드는 DEFAULT 'streampocket'로 자동 매핑(기존 동작 보존).
-- 포켓몬스팀 레코드는 enabled=true 기본으로 신규 삽입(없을 때만 — 멱등).

-- AlterTable
ALTER TABLE "alimtalk_settings" ADD COLUMN "store" "Store" NOT NULL DEFAULT 'streampocket';

-- CreateIndex (스토어당 1레코드)
CREATE UNIQUE INDEX "alimtalk_settings_store_key" ON "alimtalk_settings"("store");

-- 포켓몬스팀 기본 레코드 삽입 (이미 있으면 무시 — 멱등)
INSERT INTO "alimtalk_settings" ("id", "store", "enabled", "message_template", "updated_at")
SELECT gen_random_uuid(), 'pokemon_steam'::"Store", true, '#{서비스명} 구매가 완료되었습니다.', now()
WHERE NOT EXISTS (
  SELECT 1 FROM "alimtalk_settings" WHERE "store" = 'pokemon_steam'::"Store"
);
