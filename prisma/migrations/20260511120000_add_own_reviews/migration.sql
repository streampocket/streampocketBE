-- CreateTable
CREATE TABLE "own_reviews" (
    "id" UUID NOT NULL,
    "application_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "image_url" VARCHAR(500),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "own_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "own_reviews_application_id_key" ON "own_reviews"("application_id");

-- CreateIndex
CREATE INDEX "own_reviews_product_id_created_at_idx" ON "own_reviews"("product_id", "created_at");

-- CreateIndex
CREATE INDEX "own_reviews_user_id_created_at_idx" ON "own_reviews"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "own_reviews_rating_created_at_idx" ON "own_reviews"("rating", "created_at");

-- AddForeignKey
ALTER TABLE "own_reviews" ADD CONSTRAINT "own_reviews_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "party_applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "own_reviews" ADD CONSTRAINT "own_reviews_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "own_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "own_reviews" ADD CONSTRAINT "own_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
