-- OTTALL 파티 승인 시 자동 생성되는 주문을 위한 출처(party) 추가
ALTER TYPE "OrderSource" ADD VALUE IF NOT EXISTS 'party';
