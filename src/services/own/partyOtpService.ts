import { prisma } from '../../lib/prisma'
import { encryptSecret, decryptSecret } from '../../lib/crypto'
import { normalizeSecret, isValidSecret, generateIssueCode, TOTP_PERIOD } from '../../lib/totp'
import { PARTY_OTP_MAX_ISSUES, PARTY_OTP_VIEW_MINUTES } from '../../constants/party'
import { findOrderById } from '../../repositories/steamOrderRepository'

const VIEW_MS = PARTY_OTP_VIEW_MINUTES * 60 * 1000

// 유저 OTP 발급/재발급 (단일 진입점)
// 발급·재발급 모두 횟수 1회 차감 + 로그 기록 (총 3회 한도). 발급된 코드는 FE에서 10분간 표시 유지
export async function issuePartyOtp(applicationId: string, userId: string) {
  const application = await prisma.partyApplication.findFirst({
    where: { id: applicationId, userId },
    select: {
      status: true,
      expiresAt: true,
      otpCredential: { select: { secretEnc: true, issueCount: true } },
    },
  })
  if (!application) {
    throw Object.assign(new Error('신청 내역을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (application.status !== 'confirmed') {
    throw Object.assign(new Error('승인 완료된 신청만 OTP를 발급할 수 있습니다.'), { statusCode: 409 })
  }
  const now = new Date()
  if (!application.expiresAt || application.expiresAt <= now) {
    throw Object.assign(new Error('파티 이용 기간이 아닙니다.'), { statusCode: 409 })
  }
  if (!application.otpCredential) {
    throw Object.assign(new Error('OTP가 아직 준비되지 않았습니다. 관리자에게 문의 주세요.'), { statusCode: 409 })
  }
  if (application.otpCredential.issueCount >= PARTY_OTP_MAX_ISSUES) {
    throw Object.assign(new Error('발급 횟수를 모두 사용했습니다. 관리자에게 문의 주세요.'), { statusCode: 429 })
  }

  // 복호화·코드 생성 검증을 횟수 차감보다 먼저 수행 — 시크릿 문제로 횟수만 소진되는 사고 방지
  const secret = decryptSecret(application.otpCredential.secretEnc)
  // 클릭 시점 기준 앞으로 30초를 가장 넓게 커버하는 창의 코드 1개 발급 (교체 없음)
  const code = generateIssueCode(secret)

  // updateMany의 issueCount < MAX 가드로 동시 요청(더블클릭)에도 한도 초과 방지 (DB 레벨 원자성)
  const issued = await prisma.$transaction(async (tx) => {
    const updated = await tx.partyOtpCredential.updateMany({
      where: { applicationId, issueCount: { lt: PARTY_OTP_MAX_ISSUES } },
      data: { issueCount: { increment: 1 } },
    })
    if (updated.count === 0) {
      throw Object.assign(new Error('발급 횟수를 모두 사용했습니다. 관리자에게 문의 주세요.'), { statusCode: 429 })
    }
    const log = await tx.partyOtpIssueLog.create({
      data: { applicationId },
      select: { issuedAt: true },
    })
    const credential = await tx.partyOtpCredential.findUniqueOrThrow({
      where: { applicationId },
      select: { issueCount: true },
    })
    return { issuedAt: log.issuedAt, issueCount: credential.issueCount }
  })

  return {
    data: {
      code,
      // 카운트다운은 항상 30초부터 시작 (클릭 시점 기준 고정)
      expiresIn: TOTP_PERIOD,
      issueCount: issued.issueCount,
      remaining: PARTY_OTP_MAX_ISSUES - issued.issueCount,
      // 코드 표시 유지 종료 시각 — FE가 이 시각까지 코드를 보여주고 이후 발급 버튼 상태로 복귀
      viewExpiresAt: new Date(issued.issuedAt.getTime() + VIEW_MS),
    },
  }
}

// 주문 → 연결된 파티 신청 해석 (관리자 API 공통)
async function resolvePartyApplicationId(orderId: string): Promise<string | null> {
  const order = await findOrderById(orderId)
  if (!order) {
    throw Object.assign(new Error('주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (order.source !== 'party') {
    throw Object.assign(new Error('파티 주문에서만 OTP를 관리할 수 있습니다.'), { statusCode: 400 })
  }
  return order.partyApplicationId
}

// 관리자 — OTP 정보 조회 (시크릿 원문/암호문은 절대 미포함)
export async function adminGetPartyOtpInfo(orderId: string) {
  const applicationId = await resolvePartyApplicationId(orderId)
  if (!applicationId) {
    // 기능 도입 전 생성된 파티 주문 — 신청과 연결되어 있지 않음
    return { data: { linked: false as const } }
  }

  const [credential, logs] = await Promise.all([
    prisma.partyOtpCredential.findUnique({
      where: { applicationId },
      select: { issueCount: true, updatedAt: true },
    }),
    prisma.partyOtpIssueLog.findMany({
      where: { applicationId },
      orderBy: { issuedAt: 'desc' },
      select: { id: true, issuedAt: true },
    }),
  ])

  return {
    data: {
      linked: true as const,
      secretRegistered: credential != null,
      secretUpdatedAt: credential?.updatedAt ?? null,
      issueCount: credential?.issueCount ?? 0,
      maxIssues: PARTY_OTP_MAX_ISSUES,
      logs,
    },
  }
}

// 관리자 — 시크릿 등록/재등록 (재등록 시 발급 횟수는 유지 — 초기화는 별도 액션)
export async function adminSetPartyOtpSecret(orderId: string, rawSecret: string) {
  const applicationId = await resolvePartyApplicationId(orderId)
  if (!applicationId) {
    throw Object.assign(new Error('이 주문은 파티 신청과 연결되어 있지 않습니다.'), { statusCode: 409 })
  }
  if (!isValidSecret(rawSecret)) {
    throw Object.assign(new Error('올바른 TOTP 시크릿키(Base32)가 아닙니다.'), { statusCode: 400 })
  }
  const secretEnc = encryptSecret(normalizeSecret(rawSecret))
  await prisma.partyOtpCredential.upsert({
    where: { applicationId },
    create: { applicationId, secretEnc },
    update: { secretEnc },
  })
  return { data: { secretRegistered: true } }
}

// 관리자 — 발급 횟수 초기화 (로그는 보존)
export async function adminResetPartyOtpCount(orderId: string) {
  const applicationId = await resolvePartyApplicationId(orderId)
  if (!applicationId) {
    throw Object.assign(new Error('이 주문은 파티 신청과 연결되어 있지 않습니다.'), { statusCode: 409 })
  }
  const existing = await prisma.partyOtpCredential.findUnique({
    where: { applicationId },
    select: { id: true },
  })
  if (!existing) {
    throw Object.assign(new Error('시크릿이 등록되지 않았습니다.'), { statusCode: 409 })
  }
  await prisma.partyOtpCredential.update({
    where: { applicationId },
    data: { issueCount: 0 },
  })
  return { data: { issueCount: 0 } }
}
