-- AlterTable
ALTER TABLE "steam_order_items" ADD COLUMN     "party_application_id" UUID;

-- CreateTable
CREATE TABLE "party_otp_credentials" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "secret_enc" TEXT NOT NULL,
    "issue_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "party_otp_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "party_otp_issue_logs" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "issued_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "party_otp_issue_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "party_otp_credentials_application_id_key" ON "party_otp_credentials"("application_id");

-- CreateIndex
CREATE INDEX "party_otp_issue_logs_application_id_issued_at_idx" ON "party_otp_issue_logs"("application_id", "issued_at");

-- CreateIndex
CREATE INDEX "steam_order_items_party_application_id_idx" ON "steam_order_items"("party_application_id");

-- AddForeignKey
ALTER TABLE "steam_order_items" ADD CONSTRAINT "steam_order_items_party_application_id_fkey" FOREIGN KEY ("party_application_id") REFERENCES "party_applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_otp_credentials" ADD CONSTRAINT "party_otp_credentials_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "party_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_otp_issue_logs" ADD CONSTRAINT "party_otp_issue_logs_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "party_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

