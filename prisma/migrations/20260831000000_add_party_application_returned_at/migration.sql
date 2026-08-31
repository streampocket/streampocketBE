-- 파티 신청 반품 시각 — 확정 후 반품(파티원 제거) 시 기록.
-- 같은 카테고리 12시간 재신청 차단(부정결제 방지)의 기준. 거절·만료는 세팅하지 않는다.
ALTER TABLE "party_applications" ADD COLUMN "returned_at" TIMESTAMPTZ(6);
