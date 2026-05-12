-- AlterTable
ALTER TABLE "community_posts" ADD COLUMN "is_pinned" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "community_posts_deleted_at_is_pinned_created_at_idx" ON "community_posts"("deleted_at", "is_pinned", "created_at");
