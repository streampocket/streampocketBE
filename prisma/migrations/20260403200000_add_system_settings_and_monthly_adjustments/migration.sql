-- CreateTable
CREATE TABLE "system_settings" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "commission_rate" DECIMAL(5,2) NOT NULL,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "monthly_adjustments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "year_month" VARCHAR(7) NOT NULL,
    "payment_adjustment" INTEGER NOT NULL DEFAULT 0,
    "commission_adjustment" INTEGER NOT NULL DEFAULT 0,
    "net_revenue_adjustment" INTEGER NOT NULL DEFAULT 0,
    "memo" VARCHAR(500),
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "monthly_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "monthly_adjustments_year_month_key" ON "monthly_adjustments"("year_month");
