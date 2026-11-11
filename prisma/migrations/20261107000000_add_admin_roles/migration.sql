-- 직원(알바) 관리자 계정 — 역할·페이지 권한·활성 여부.
-- 기존 데이터 변경 없음: 기존 관리자는 기본값으로 owner(전체 권한)·활성이 되어 동작이 그대로다.
-- 칸 추가만 하므로 코드를 되돌려도 이전 코드는 새 칸을 무시한다 (단, 되돌리기 전 staff 계정 삭제 필요).

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('owner', 'staff');

-- AlterTable
ALTER TABLE "admins" ADD COLUMN     "role" "AdminRole" NOT NULL DEFAULT 'owner',
ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "is_active" BOOLEAN NOT NULL DEFAULT true;
