-- CreateEnum
CREATE TYPE "ReviewCodeStatus" AS ENUM ('unused', 'used');

-- CreateTable
CREATE TABLE "review_codes" (
    "id" UUID NOT NULL,
    "game_name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(255) NOT NULL,
    "status" "ReviewCodeStatus" NOT NULL DEFAULT 'unused',
    "used_by" VARCHAR(255),
    "used_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "review_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "review_codes_status_created_at_idx" ON "review_codes"("status", "created_at");

-- CreateIndex
CREATE INDEX "review_codes_game_name_idx" ON "review_codes"("game_name");
