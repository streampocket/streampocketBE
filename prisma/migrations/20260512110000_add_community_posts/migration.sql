-- CreateEnum
CREATE TYPE "CommunityCategory" AS ENUM ('notice', 'free');

-- CreateTable
CREATE TABLE "community_posts" (
    "id" UUID NOT NULL,
    "category" "CommunityCategory" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "image_url" VARCHAR(500),
    "author_user_id" UUID,
    "author_admin_id" UUID,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "community_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "community_posts_deleted_at_category_created_at_idx" ON "community_posts"("deleted_at", "category", "created_at");

-- CreateIndex
CREATE INDEX "community_posts_deleted_at_created_at_idx" ON "community_posts"("deleted_at", "created_at");

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_author_user_id_fkey" FOREIGN KEY ("author_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_posts" ADD CONSTRAINT "community_posts_author_admin_id_fkey" FOREIGN KEY ("author_admin_id") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;
