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
 * 관리자 알림(상단 종)용 — 아직 처리(횟수 초기화)하지 않은 구매자 재발급 요청.
 * 이용 중인(승인 완료 + 만료 전) 신청만 — 만료·취소된 신청의 요청은 처리할 필요가 없어 뺀다.
 * 시크릿 암호문(secretEnc)은 select 금지.
 */
export function findPendingOtpResetRequests(now: Date) {
  return prisma.partyOtpCredential.findMany({
    where: {
      resetRequestedAt: { not: null },
      application: { status: 'confirmed', expiresAt: { gt: now } },
    },
    orderBy: { resetRequestedAt: 'asc' },
    select: {
      applicationId: true,
      resetRequestedAt: true,
      application: {
        select: {
          expiresAt: true,
          user: { select: { name: true, phone: true } },
          product: { select: { name: true, partyType: true } },
        },
      },
    },
  })
}

/**
 * 재발급 요청 표시 —횟수를 다 썼고 아직 요청하지 않은 경우에만 기록한다.
 * 조건을 where에 넣어 더블클릭·동시 요청에도 한 건만 기록된다 (반환 count로 판정).
 */
export function markOtpResetRequested(applicationId: string, maxIssues: number, requestedAt: Date) {
  return prisma.partyOtpCredential.updateMany({
    where: { applicationId, issueCount: { gte: maxIssues }, resetRequestedAt: null },
    data: { resetRequestedAt: requestedAt },
  })
}
