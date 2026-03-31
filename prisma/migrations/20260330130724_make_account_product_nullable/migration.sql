-- DropForeignKey
ALTER TABLE "steam_accounts" DROP CONSTRAINT "steam_accounts_product_id_fkey";

-- AlterTable
ALTER TABLE "steam_accounts" ALTER COLUMN "product_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "steam_accounts" ADD CONSTRAINT "steam_accounts_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "steam_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
