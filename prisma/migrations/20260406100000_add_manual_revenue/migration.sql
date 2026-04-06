-- CreateTable
CREATE TABLE "manual_revenues" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "date" DATE NOT NULL,
    "amount" INTEGER NOT NULL,
    "memo" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "manual_revenues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "manual_revenues_date_idx" ON "manual_revenues"("date");
