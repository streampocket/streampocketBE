import { OwnProductType } from '@prisma/client'

// 파티 타입 표시명 (로그·디스코드 등 사람용 문구).
export const PARTY_TYPE_LABEL: Record<OwnProductType, string> = {
  personal: '개인형',
  shared: '공유형',
}
