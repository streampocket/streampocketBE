-- AlterEnum: FulfillmentStatus에 in_progress(진행중) 값을 pending과 completed 사이에 추가
-- 새 값을 즉시 사용하는 구문(백필 등)이 없으므로 별도 COMMIT 불필요.
ALTER TYPE "FulfillmentStatus" ADD VALUE 'in_progress' BEFORE 'completed';
