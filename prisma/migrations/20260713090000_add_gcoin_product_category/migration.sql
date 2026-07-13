-- 배그상품 카테고리 도입 (지코인/아이템)
-- 기존 상품은 DEFAULT 'gcoin'으로 전부 지코인 처리
CREATE TYPE "GcoinProductCategory" AS ENUM ('gcoin', 'item');

ALTER TABLE "gcoin_products" ADD COLUMN "category" "GcoinProductCategory" NOT NULL DEFAULT 'gcoin';

-- 아이템 상품은 지코인 수량이 없으므로 nullable로 변경
ALTER TABLE "gcoin_products" ALTER COLUMN "gcoin_amount" DROP NOT NULL;
