-- 스키마-마이그레이션 체인 정합 교정 (2026-08-10)
--
-- 배경: 과거에 이미 적용된 마이그레이션 파일에 손으로 교정 줄이 추가된 적이 있다
-- (20260404080234의 expenses DROP DEFAULT 등). 이미 적용된 파일의 수정은 어떤 DB에서도
-- 다시 실행되지 않으므로, 그 교정들은 사실상 어디에도 반영되지 않았고
-- 빈 DB에서 체인을 재생하면 schema.prisma와 아래 6가지가 어긋난 상태로 끝난다.
--
-- 여기서 한꺼번에 바로잡는다. 전부 멱등이라(기본값이 없으면 DROP DEFAULT는 no-op,
-- 인덱스가 없으면 IF EXISTS로 통과) 운영 DB가 어느 상태이든 안전하다.
--
-- id 기본값: 스키마의 @default(uuid())는 Prisma 클라이언트가 값을 만들어 보내는 방식이라
-- DB 기본값(gen_random_uuid())은 쓰이지 않는 군더더기다. 스키마 기대값(None)에 맞춘다.

DROP INDEX IF EXISTS "steam_order_items_decision_date_idx";

ALTER TABLE "expenses" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "manual_revenues" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "party_applications" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "terms_agreements" ALTER COLUMN "id" DROP DEFAULT;
ALTER TABLE "user_social_accounts" ALTER COLUMN "id" DROP DEFAULT;
