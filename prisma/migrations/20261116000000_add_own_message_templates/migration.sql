-- 고객 안내 양식 (관리자 "안내 양식" 페이지). 신규 테이블 생성만 — 기존 데이터 변경 없음.

-- CreateTable
CREATE TABLE "own_message_templates" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "content" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "own_message_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "own_message_templates_name_key" ON "own_message_templates"("name");
