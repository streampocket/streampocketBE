-- 스토어 리스팅에 네이버 실제 판매상태(statusType) 저장 컬럼 추가.
-- 가산형(nullable) — 기존 행은 null(아직 미동기화), 다음 동기화 시 네이버 statusType으로 채워짐.

ALTER TABLE "store_listings" ADD COLUMN "naver_sale_status" VARCHAR(30);
