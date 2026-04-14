-- 기존 date(날짜만) → timestamptz(시간 포함)로 변경
-- 기존 데이터는 KST 자정(00:00:00+09:00)으로 변환
ALTER TABLE "expenses"
  ALTER COLUMN "date" TYPE timestamptz(6)
  USING (date::timestamp AT TIME ZONE 'Asia/Seoul');
