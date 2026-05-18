-- AlterTable: 시스템 설정에 챗봇 웰컴 인사말 컬럼 추가
ALTER TABLE "system_settings" ADD COLUMN "chatbot_welcome_message" TEXT;

-- CreateTable: 카카오 챗봇 메뉴 항목
CREATE TABLE "chatbot_menu_items" (
    "id" UUID NOT NULL,
    "label" VARCHAR(100) NOT NULL,
    "body" TEXT NOT NULL,
    "image_url" VARCHAR(500),
    "buttons" JSONB NOT NULL DEFAULT '[]',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "chatbot_menu_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "chatbot_menu_items_is_active_sort_order_idx" ON "chatbot_menu_items"("is_active", "sort_order");
