-- 지코인 상품 달러 정가 + 환율 테이블
-- 달러 정가: 저장은 USD, 조회 시 최신 환율로 원화 환산 (기존 원화 정가 list_price와 병존, 달러 우선)
ALTER TABLE "gcoin_products" ADD COLUMN "list_price_usd" DECIMAL(10,2);

CREATE TABLE "exchange_rates" (
    "id" UUID NOT NULL,
    "base_currency" VARCHAR(3) NOT NULL,
    "quote_currency" VARCHAR(3) NOT NULL,
    "rate" DECIMAL(12,4) NOT NULL,
    "fetched_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "exchange_rates_base_currency_quote_currency_key" ON "exchange_rates"("base_currency", "quote_currency");
