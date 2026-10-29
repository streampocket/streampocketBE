-- 파티 OTP 재발급 요청 — 구매자가 발급 횟수(3회)를 다 쓴 뒤 마이페이지에서 "재발급 요청"을 누른 시각.
-- 처리(관리자 횟수 초기화) 전까지 재요청을 막아 디스코드 알림이 한 번만 가게 한다.
-- 기존 데이터 변경 없음: nullable 컬럼 추가만.

-- AlterTable
ALTER TABLE "party_otp_credentials" ADD COLUMN "reset_requested_at" TIMESTAMPTZ(6);
