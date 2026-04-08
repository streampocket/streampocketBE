-- CreateEnum
CREATE TYPE "PartyApplicationStatus" AS ENUM ('pending', 'confirmed', 'cancelled');

-- CreateTable
CREATE TABLE "party_applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "product_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "price" INTEGER NOT NULL,
    "fee" INTEGER NOT NULL,
    "total_amount" INTEGER NOT NULL,
    "status" "PartyApplicationStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "party_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "party_applications_product_id_user_id_key" ON "party_applications"("product_id", "user_id");

-- CreateIndex
CREATE INDEX "party_applications_user_id_created_at_idx" ON "party_applications"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "party_applications" ADD CONSTRAINT "party_applications_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "own_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "party_applications" ADD CONSTRAINT "party_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
