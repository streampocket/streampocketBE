-- 파티 승인 시 드라마 계정 자동 배정 결과 링크.
-- DramaMember가 아니라 party_applications 쪽에 링크를 두는 이유:
-- 드라마 계정 수정(replaceDramaAccount)이 파티원을 전부 지우고 새 id로 다시 만들어,
-- drama_members에 건 링크는 관리자가 메모를 한 번만 고쳐도 사라진다.
ALTER TABLE "party_applications" ADD COLUMN "drama_account_id" UUID;
ALTER TABLE "party_applications" ADD COLUMN "drama_member_id" UUID;

-- SetNull — 계정·파티원이 지워져도 신청 데이터는 그대로 남아야 한다.
ALTER TABLE "party_applications"
  ADD CONSTRAINT "party_applications_drama_account_id_fkey"
  FOREIGN KEY ("drama_account_id") REFERENCES "drama_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "party_applications"
  ADD CONSTRAINT "party_applications_drama_member_id_fkey"
  FOREIGN KEY ("drama_member_id") REFERENCES "drama_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- 신청 승인 모달의 "계정 자동 배정 + 알림톡 발송" 토글 기본값 (전역 1행 설정)
ALTER TABLE "system_settings" ADD COLUMN "party_auto_deliver_enabled" BOOLEAN NOT NULL DEFAULT false;
