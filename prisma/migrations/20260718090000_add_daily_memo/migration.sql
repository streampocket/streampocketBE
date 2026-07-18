-- 대시보드 캘린더 일일 메모 테이블 (날짜당 1개, 전사 기준)
CREATE TABLE "daily_memos" (
    "id" UUID NOT NULL,
    "date" DATE NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "daily_memos_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "daily_memos_date_key" ON "daily_memos"("date");
