-- GCOIN 구매 기능: 구매자 휴대폰 인증 + 주문(신청) + 통합 주문 source 확장

-- OrderSource enum에 gcoin 추가 (통합 주문관리 편입용)
ALTER TYPE "OrderSource" ADD VALUE 'gcoin';

-- 구매자 휴대폰 인증 (비회원 로그인, OTTALL phone_verifications와 분리)
CREATE TABLE "gcoin_phone_verifications" (
    "id" UUID NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "code" VARCHAR(6) NOT NULL,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "privacy_agreed_at" TIMESTAMPTZ(6) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gcoin_phone_verifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "gcoin_phone_verifications_phone_created_at_idx" ON "gcoin_phone_verifications"("phone", "created_at");

-- 주문(신청) 상태
CREATE TYPE "GcoinOrderStatus" AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE "gcoin_orders" (
    "id" UUID NOT NULL,
    "order_no" VARCHAR(40) NOT NULL,
    "product_id" UUID NOT NULL,
    "product_name" VARCHAR(255) NOT NULL,
    "gcoin_amount" INTEGER,
    "sale_price" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "buyer_phone" VARCHAR(20) NOT NULL,
    "status" "GcoinOrderStatus" NOT NULL DEFAULT 'pending',
    "reject_reason" VARCHAR(500),
    "steam_order_item_id" UUID,
    "approved_at" TIMESTAMPTZ(6),
    "rejected_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "gcoin_orders_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "gcoin_orders_order_no_key" ON "gcoin_orders"("order_no");
CREATE UNIQUE INDEX "gcoin_orders_steam_order_item_id_key" ON "gcoin_orders"("steam_order_item_id");
CREATE INDEX "gcoin_orders_status_created_at_idx" ON "gcoin_orders"("status", "created_at");
CREATE INDEX "gcoin_orders_buyer_phone_created_at_idx" ON "gcoin_orders"("buyer_phone", "created_at");

ALTER TABLE "gcoin_orders" ADD CONSTRAINT "gcoin_orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "gcoin_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
