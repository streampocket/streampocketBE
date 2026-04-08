-- PartyApplicationStatus enum에 expired 값 추가
ALTER TYPE "PartyApplicationStatus" ADD VALUE 'expired';

-- PartyApplication에 startedAt, expiresAt 컬럼 추가
ALTER TABLE "party_applications" ADD COLUMN "started_at" TIMESTAMPTZ(6);
ALTER TABLE "party_applications" ADD COLUMN "expires_at" TIMESTAMPTZ(6);

-- 만료 배치 쿼리 최적화 인덱스
CREATE INDEX "party_applications_status_expires_at_idx" ON "party_applications"("status", "expires_at");

-- 기존 confirmed 데이터 백필 (product.startedAt + durationDays 기준)
UPDATE party_applications pa
SET started_at = op.started_at,
    expires_at = op.started_at + (op.duration_days || ' days')::interval
FROM own_products op
WHERE pa.product_id = op.id
  AND pa.status = 'confirmed'
  AND op.started_at IS NOT NULL;
