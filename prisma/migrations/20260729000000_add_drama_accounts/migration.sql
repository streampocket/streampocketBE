-- CreateTable
CREATE TABLE "drama_accounts" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "password_enc" TEXT NOT NULL,
    "otp_secret_enc" TEXT NOT NULL,
    "platform" VARCHAR(50),
    "capacity" INTEGER,
    "capacity_label" VARCHAR(20),
    "due_at" DATE,
    "notes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "drama_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "drama_members" (
    "id" UUID NOT NULL,
    "account_id" UUID NOT NULL,
    "site" VARCHAR(50),
    "name" VARCHAR(100) NOT NULL,
    "site_spaced" BOOLEAN NOT NULL DEFAULT true,
    "end_date" DATE NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "days" INTEGER NOT NULL,
    "suffix" VARCHAR(50),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "drama_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "drama_accounts_email_key" ON "drama_accounts"("email");

-- CreateIndex
CREATE INDEX "drama_accounts_due_at_idx" ON "drama_accounts"("due_at");

-- CreateIndex
CREATE INDEX "drama_members_account_id_idx" ON "drama_members"("account_id");

-- CreateIndex
CREATE INDEX "drama_members_end_date_idx" ON "drama_members"("end_date");

-- AddForeignKey
ALTER TABLE "drama_members" ADD CONSTRAINT "drama_members_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "drama_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
