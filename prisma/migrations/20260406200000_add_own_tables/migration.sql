-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('local', 'kakao', 'google');

-- CreateEnum
CREATE TYPE "OwnProductStatus" AS ENUM ('recruiting', 'closed', 'expired');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "password" TEXT,
    "name" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "provider" "AuthProvider" NOT NULL DEFAULT 'local',
    "provider_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "own_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "own_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "own_products" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category_id" UUID NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "total_slots" INTEGER NOT NULL,
    "filled_slots" INTEGER NOT NULL DEFAULT 0,
    "image_path" VARCHAR(500),
    "notes" TEXT,
    "status" "OwnProductStatus" NOT NULL DEFAULT 'recruiting',
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "own_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phone_verifications" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "phone_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_provider_provider_id_key" ON "users"("provider", "provider_id");

-- CreateIndex
CREATE UNIQUE INDEX "own_categories_name_key" ON "own_categories"("name");

-- CreateIndex
CREATE INDEX "own_products_category_id_status_idx" ON "own_products"("category_id", "status");

-- CreateIndex
CREATE INDEX "own_products_user_id_idx" ON "own_products"("user_id");

-- CreateIndex
CREATE INDEX "own_products_status_created_at_idx" ON "own_products"("status", "created_at");

-- CreateIndex
CREATE INDEX "phone_verifications_phone_created_at_idx" ON "phone_verifications"("phone", "created_at");

-- AddForeignKey
ALTER TABLE "own_products" ADD CONSTRAINT "own_products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "own_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "own_products" ADD CONSTRAINT "own_products_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
