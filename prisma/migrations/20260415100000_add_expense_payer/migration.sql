-- CreateEnum
CREATE TYPE "ExpensePayer" AS ENUM ('song_donggeon', 'im_jeongbin');

-- AlterTable
ALTER TABLE "expenses" ADD COLUMN "payer" "ExpensePayer" NOT NULL DEFAULT 'song_donggeon';
