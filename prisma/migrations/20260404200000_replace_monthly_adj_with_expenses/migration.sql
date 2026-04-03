-- CreateEnum
CREATE TYPE "ExpenseCategory" AS ENUM ('game_purchase', 'country_change', 'review_game', 'other');

-- CreateTable
CREATE TABLE "expenses" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" DATE NOT NULL,
    "category" "ExpenseCategory" NOT NULL,
    "amount" INTEGER NOT NULL,
    "memo" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "expenses_date_idx" ON "expenses"("date");
CREATE INDEX "expenses_category_date_idx" ON "expenses"("category", "date");

-- AlterTable: add alimtalk_unit_cost to system_settings
ALTER TABLE "system_settings" ADD COLUMN "alimtalk_unit_cost" DECIMAL(7,1) NOT NULL DEFAULT 6.5;

-- DropTable
DROP TABLE "monthly_adjustments";
