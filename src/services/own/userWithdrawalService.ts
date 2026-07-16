import { sendDiscordAlert } from '../../lib/discord'
import {
  deleteUserById,
  findUserById,
  findWithdrawnUsersBefore,
  withdrawUserById,
} from '../../repositories/own/userRepository'
import { findWithdrawalBlockingApplication } from '../../repositories/own/partyApplicationRepository'

// 탈퇴 사유 선택지 (fe/constants/app.ts의 WITHDRAWAL_REASONS와 코드 일치 필수)
export const WITHDRAWAL_REASON_LABELS = {
  price: '가격이 비싸서',
  low_usage: '이용 빈도가 낮아서',
  no_party: '원하는 파티가 없어서',
  dissatisfied: '서비스 불만',
  other: '기타',
} as const

export type WithdrawalReasonCode = keyof typeof WITHDRAWAL_REASON_LABELS

// 탈퇴 회원 정보 보관 기간 — 경과 시 크론이 완전 삭제
export const WITHDRAWAL_RETENTION_DAYS = 30

// 완전 삭제된 회원의 신청/리뷰(userId null)를 응답에 담을 때의 대체 표시 — FE가 user.name을 직접 참조하므로 형태 유지
export const WITHDRAWN_USER_DISPLAY = {
  id: null,
  name: '탈퇴한 회원',
  email: '-',
  phone: '-',
} as const

const PROVIDER_LABELS: Record<string, string> = {
  local: '일반',
  kakao: '카카오',
  google: '구글',
}

function formatKstDateTime(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}

// 진행 중/대기중 파티가 있으면 탈퇴 불가 (셀프·관리자 공통 — 파티 데이터 정합성)
async function assertNoBlockingApplication(userId: string): Promise<void> {
  const blocking = await findWithdrawalBlockingApplication(userId)
  if (!blocking) return

  if (blocking.status === 'pending') {
    throw Object.assign(
      new Error(
        `처리 중인 파티 신청이 있어 탈퇴할 수 없습니다. (${blocking.product.name}) 신청이 승인 또는 거절된 뒤 다시 시도해주세요.`,
      ),
      { statusCode: 409 },
    )
  }
  throw Object.assign(
    new Error(
      `이용 중인 파티가 있어 탈퇴할 수 없습니다. (${blocking.product.name}) 파티 기간이 끝난 뒤 다시 시도해주세요.`,
    ),
    { statusCode: 409 },
  )
}

type WithdrawExecutionInput = {
  userId: string
  reason: string
  byAdmin: boolean
}

// 공통 탈퇴 처리 — 소프트 삭제 + 유니크 컬럼 익명화(즉시 재가입 허용) + 원본 연락처 백업 + 디스코드 알림
async function executeWithdrawal(input: WithdrawExecutionInput) {
  const user = await findUserById(input.userId)
  if (!user) {
    throw Object.assign(new Error('회원을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (user.deletedAt) {
    throw Object.assign(new Error('이미 탈퇴 처리된 회원입니다.'), { statusCode: 409 })
  }

  await assertNoBlockingApplication(user.id)

  const deletedAt = new Date()
  await withdrawUserById(user.id, {
    deletedAt,
    withdrawalReason: input.reason,
    withdrawnByAdmin: input.byAdmin,
    originalEmail: user.email,
    originalPhone: user.phone,
    email: `withdrawn_${user.id}@deleted.ottall`,
    phone: `del_${user.id.replace(/-/g, '').slice(0, 14)}`,
  })

  const message = [
    `[회원 탈퇴${input.byAdmin ? ' — 관리자 처리' : ''}]`,
    `이름: ${user.name} (${user.email})`,
    `가입방식: ${PROVIDER_LABELS[user.provider] ?? user.provider} / 가입일: ${formatKstDateTime(user.createdAt)}`,
    `사유: ${input.reason}`,
    `탈퇴일시: ${formatKstDateTime(deletedAt)} (KST) · ${WITHDRAWAL_RETENTION_DAYS}일 후 완전 삭제`,
  ].join('\n')
  sendDiscordAlert('partyApply', message, { color: 0x95a5a6 }).catch(() => {})

  return { data: { withdrawnAt: deletedAt } }
}

// 셀프 탈퇴 (마이페이지) — 사유는 선택지 코드 + 기타 직접입력
export async function withdrawSelf(
  userId: string,
  reasonCode: WithdrawalReasonCode,
  reasonDetail?: string,
) {
  const detail = reasonDetail?.trim()
  const reason =
    reasonCode === 'other' && detail
      ? `기타: ${detail}`
      : WITHDRAWAL_REASON_LABELS[reasonCode]
  return executeWithdrawal({ userId, reason, byAdmin: false })
}

// 관리자 강제 탈퇴 — 사유 자유 입력 (필수)
export async function adminWithdrawUser(userId: string, reason: string) {
  return executeWithdrawal({
    userId,
    reason: `관리자 처리: ${reason.trim()}`,
    byAdmin: true,
  })
}

// 보관 기간(30일) 경과 탈퇴 회원 완전 삭제 — 매일 00:00 크론 + 수동 엔드포인트
// 유저 행 삭제 시 TermsAgreement는 Cascade, PartyApplication/OwnReview/CommunityPost는 SetNull(익명 보존)
export async function purgeWithdrawnUsers() {
  const cutoff = new Date(Date.now() - WITHDRAWAL_RETENTION_DAYS * 24 * 60 * 60 * 1000)
  const targets = await findWithdrawnUsersBefore(cutoff)

  let purged = 0
  const failures: string[] = []
  for (const target of targets) {
    try {
      await deleteUserById(target.id)
      purged++
    } catch (error) {
      failures.push(target.id)
      console.error('[user-purge] 탈퇴 회원 완전 삭제 실패', { userId: target.id, error })
    }
  }

  if (purged > 0 || failures.length > 0) {
    const lines = [`[탈퇴 회원 완전 삭제] 보관 기간(${WITHDRAWAL_RETENTION_DAYS}일) 경과 회원 ${purged}명 삭제 완료`]
    if (failures.length > 0) {
      lines.push(`⚠️ 삭제 실패 ${failures.length}건 — 서버 로그 확인 필요`)
    }
    sendDiscordAlert('partyApply', lines.join('\n'), { color: 0x95a5a6 }).catch(() => {})
  }

  return { purged, failed: failures.length }
}
