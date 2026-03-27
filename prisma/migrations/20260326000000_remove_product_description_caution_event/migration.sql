-- AlterTable: SteamProduct에서 description, caution, event 컬럼 제거
ALTER TABLE "steam_products"
  DROP COLUMN IF EXISTS "description",
  DROP COLUMN IF EXISTS "caution",
  DROP COLUMN IF EXISTS "event";
