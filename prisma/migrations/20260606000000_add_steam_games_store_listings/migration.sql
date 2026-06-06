-- 멀티스토어 상품 모델 — 게임 마스터(steam_games) + 스토어별 리스팅(store_listings)
-- 전부 가산: 기존 steam_products / steam_order_items 는 변경하지 않는다.
-- steam_accounts 에는 game_id 컬럼만 추가(기존 product_id 유지).

-- CreateEnum
CREATE TYPE "Store" AS ENUM ('streampocket', 'pokemon_steam');

-- CreateEnum
CREATE TYPE "SteamProductType" AS ENUM ('AA', 'NA', 'BG');

-- CreateTable
CREATE TABLE "steam_games" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "product_type" "SteamProductType" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "steam_games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "store_listings" (
    "id" UUID NOT NULL,
    "store" "Store" NOT NULL,
    "game_id" UUID NOT NULL,
    "naver_product_id" VARCHAR(100) NOT NULL,
    "price" INTEGER,
    "discount_price_pc" INTEGER,
    "discount_price_mobile" INTEGER,
    "status" "ProductStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "store_listings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "store_listings_naver_product_id_key" ON "store_listings"("naver_product_id");

-- CreateIndex
CREATE INDEX "store_listings_store_status_idx" ON "store_listings"("store", "status");

-- CreateIndex
CREATE UNIQUE INDEX "store_listings_store_game_id_key" ON "store_listings"("store", "game_id");

-- AlterTable: 계정 재고를 게임에 연결할 game_id (nullable, 기존 product_id 와 공존)
ALTER TABLE "steam_accounts" ADD COLUMN "game_id" UUID;

-- CreateIndex
CREATE INDEX "steam_accounts_game_id_status_created_at_idx" ON "steam_accounts"("game_id", "status", "created_at");

-- AddForeignKey
ALTER TABLE "store_listings" ADD CONSTRAINT "store_listings_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "steam_games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "steam_accounts" ADD CONSTRAINT "steam_accounts_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "steam_games"("id") ON DELETE SET NULL ON UPDATE CASCADE;
