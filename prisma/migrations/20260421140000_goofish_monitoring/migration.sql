-- AlterTable
ALTER TABLE "steam_products"
  ADD COLUMN "goofish_monitor_enabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "goofish_search_query" VARCHAR(255),
  ADD COLUMN "goofish_today_min_yuan" DECIMAL(10, 2),
  ADD COLUMN "goofish_today_checked_at" TIMESTAMPTZ(6),
  ADD COLUMN "goofish_prev_min_yuan" DECIMAL(10, 2),
  ADD COLUMN "goofish_prev_checked_at" TIMESTAMPTZ(6);
