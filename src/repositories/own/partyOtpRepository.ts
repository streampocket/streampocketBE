import { prisma } from '../../lib/prisma'

// 재발급 요청 판정·디스코드 알림에 필요한 신청 정보 (본인 신청만)
// 시크릿 암호문(secretEnc)은 select 금지 — 판정에 필요 없다
export function findApplicationForOtpResetRequest(applicationId: string, userId: string) {
  return prisma.partyApplication.findFirst({
    where: { id: applicationId, userId },
    select: {
      id: true,
      status: true,
      expiresAt: true,
      user: { select: { name: true, phone: true } },
      product: { select: { name: true, partyType: true } },
      otpCredential: { select: { issueCount: true, resetRequestedAt: true } },
    },
  })
}

/**
 * 재발급 요청 표시 — 횟수를 다 썼고 아직 요청하지 않은 경우에만 기록한다.
 * 조건을 where에 넣어 더블클릭·동시 요청에도 한 건만 기록된다 (반환 count로 판정).
 */
export function markOtpResetRequested(applicationId: string, maxIssues: number, requestedAt: Date) {
  return prisma.partyOtpCredential.updateMany({
    where: { applicationId, issueCount: { gte: maxIssues }, resetRequestedAt: null },
    data: { resetRequestedAt: requestedAt },
  })
}
