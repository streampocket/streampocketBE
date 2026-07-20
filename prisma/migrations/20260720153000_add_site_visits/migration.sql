-- CreateTable
CREATE TABLE "site_visits" (
    "id" UUID NOT NULL,
    "site" VARCHAR(10) NOT NULL,
    "visitor_id" UUID NOT NULL,
    "visit_date" VARCHAR(10) NOT NULL,
    "source" VARCHAR(30) NOT NULL,
    "referrer_host" VARCHAR(255),
    "referrer" VARCHAR(500),
    "landing_path" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_visits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "site_visits_site_visit_date_source_idx" ON "site_visits"("site", "visit_date", "source");

-- CreateIndex
CREATE UNIQUE INDEX "site_visits_site_visitor_id_visit_date_key" ON "site_visits"("site", "visitor_id", "visit_date");
