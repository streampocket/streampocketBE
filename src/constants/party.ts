import { OwnProductType } from '@prisma/client'

// 파티 타입 표시명 (로그·디스코드 등 사람용 문구).
export const PARTY_TYPE_LABEL: Record<OwnProductType, string> = {
  personal: '개인형',
  shared: '공유형',
}

// 파티 OTP: 구매자당 최대 발급 횟수 — 재발급 포함 모든 발급이 1회씩 차감
export const PARTY_OTP_MAX_ISSUES = 3

// 파티 OTP: 발급된 코드를 화면에 유지하는 시간(분) — 경과 시 발급 버튼 상태로 복귀
export const PARTY_OTP_VIEW_MINUTES = 10
