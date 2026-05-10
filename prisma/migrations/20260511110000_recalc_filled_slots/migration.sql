-- 옛 정책(신청 시 즉시 슬롯 +1) 시기에 증가된 잔여 filled_slots 값을
-- 신정책(confirmed 시점에만 +1) 기준으로 일괄 보정한다.
-- 멱등 — 재실행해도 결과 동일.
UPDATE own_products op
SET filled_slots = COALESCE(
  (SELECT COUNT(*)::int FROM party_applications pa
   WHERE pa.product_id = op.id AND pa.status = 'confirmed'),
  0
);
