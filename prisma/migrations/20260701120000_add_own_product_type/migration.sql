-- CreateEnum
CREATE TYPE "OwnProductType" AS ENUM ('personal', 'shared');

-- AlterTable
ALTER TABLE "own_products" ADD COLUMN "party_type" "OwnProductType" NOT NULL DEFAULT 'shared';
