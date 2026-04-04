-- AlterEnum
ALTER TYPE "AccountStatus" ADD VALUE 'manual';

-- DropIndex
DROP INDEX "steam_order_items_decision_date_idx";

-- AlterTable
ALTER TABLE "expenses" ALTER COLUMN "id" DROP DEFAULT;

-- AlterTable
ALTER TABLE "steam_accounts" ADD COLUMN     "secondary_email_site_url" VARCHAR(2048);

-- AlterTable
ALTER TABLE "system_settings" ALTER COLUMN "id" DROP DEFAULT;
