-- CreateEnum
CREATE TYPE "PartyDurationMode" AS ENUM ('countdown', 'fixed');

-- AlterTable
ALTER TABLE "own_products" ADD COLUMN "duration_mode" "PartyDurationMode" NOT NULL DEFAULT 'countdown';
