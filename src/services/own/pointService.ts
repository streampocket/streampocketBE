import { prisma } from '../../lib/prisma'
import type { Prisma } from '@prisma/client'
import {
  createPointTransaction,
  decrementPointIfEnough,
  decrementPointToZero,
  findRefundableAmount,
  findReviewRewardAmount,
  findUserPointBalance,
  hasReviewReward,
  incrementPoint,
} from '../../repositories/own/pointRepository'
import { getReviewPointTiers, type ReviewPointTiers } from '../systemSettingsService'

// 포인트 적립·사용·반환의 판단 규칙이 전부 여기 모인다.
// 저장소는 "어떻게 깎느냐"만 알고, "얼마를 언제 주느냐"는 이 파일이 정한다.

type Db = Prisma.TransactionClient | typeof prisma

/**
 * 실결제액으로 적립 포인트를 정한다.
 *
 * 기준은 총액이 아니라 **실제로 낸 돈**(총액 − 사용 포인트)이다.
 * 총액 기준이면 포인트로 산 건에 또 포인트가 붙어 계속 불어난다.
 */
export function resolveReviewReward(paidAmount: number, tiers: ReviewPointTiers): number {
  if (paidAmount <= tiers.tier1Max) return tiers.tier1Point
  if (paidAmount <= tiers.tier2Max) return tiers.tier2Point
  return tiers.tier3Point
}

/** 화면 안내 문구용 — 이 신청에 리뷰를 쓰면 얼마 받는지 (실제 지급은 grantReviewReward가 한다) */
export async function previewReviewReward(paidAmount: number): Promise<number> {
  const tiers = await getReviewPointTiers()
  return resolveReviewReward(paidAmount, tiers)
}

/**
 * 리뷰 작성 적립.
 *
 * 리뷰는 신청당 1개(unique)라 관리자가 지우면 재작성이 가능하다.
 * **같은 reviewId의 지급 이력이 있으면 다시 주지 않는다.**
 * 지급액은 지급 시점의 설정값으로 정해지고, 나중에 설정이 바뀌어도 과거 지급은 그대로다.
 */
export async function grantReviewReward(
  db: Db,
  input: { userId: string; reviewId: string; paidAmount: number },
): Promise<{ granted: number }> {
  if (await hasReviewReward(db, input.reviewId)) return { granted: 0 }

  const tiers = await getReviewPointTiers()
  const amount = resolveReviewReward(input.paidAmount, tiers)
  if (amount <= 0) return { granted: 0 }

  const { pointBalance } = await incrementPoint(db, input.userId, amount)
  await createPointTransaction(db, {
    userId: input.userId,
    type: 'review_reward',
    amount,
    balanceAfter: pointBalance,
    reviewId: input.reviewId,
    memo: `리뷰 작성 적립 (실결제 ${input.paidAmount.toLocaleString('ko-KR')}원)`,
  })
  return { granted: amount }
}

/**
 * 관리자 리뷰 삭제로 회수.
 * 이미 써버려 잔액이 모자라면 **0까지만** 깎는다 (음수 잔액 금지).
 */
export async function revokeReviewReward(
  db: Db,
  input: { userId: string; reviewId: string },
): Promise<{ revoked: number }> {
  const granted = await findReviewRewardAmount(db, input.reviewId)
  if (granted <= 0) return { revoked: 0 }

  const { revoked, balanceAfter } = await decrementPointToZero(db, input.userId, granted)
  if (revoked === 0) return { revoked: 0 }

  await createPointTransaction(db, {
    userId: input.userId,
    type: 'review_revoke',
    amount: -revoked,
    balanceAfter,
    reviewId: input.reviewId,
    memo: '리뷰 삭제로 회수',
  })
  return { revoked }
}

const conflict = (message: string) => Object.assign(new Error(message), { statusCode: 409 })

/**
 * 파티 신청에 포인트 사용.
 *
 * 사용액은 **서버가 정한다** — 화면은 쓸지 말지(boolean)만 보낸다.
 * 클라이언트가 보낸 금액을 믿으면 조작 여지가 생긴다.
 * 총액을 넘겨 쓰지 않고, 잔액이 모자라면 있는 만큼만 쓴다.
 */
export async function usePointForApplication(
  db: Db,
  input: { userId: string; applicationId: string; totalAmount: number },
): Promise<{ usedPoint: number }> {
  const balance = (await findUserPointBalance(db, input.userId)) ?? 0
  const usedPoint = Math.min(balance, input.totalAmount)
  if (usedPoint <= 0) return { usedPoint: 0 }

  const ok = await decrementPointIfEnough(db, input.userId, usedPoint)
  if (!ok) {
    // 조회와 차감 사이에 다른 신청이 먼저 썼다는 뜻 — 조용히 0으로 넘기지 않고 막는다
    throw conflict('보유 포인트가 부족합니다. 새로고침 후 다시 시도해 주세요.')
  }

  const balanceAfter = (await findUserPointBalance(db, input.userId)) ?? 0
  await createPointTransaction(db, {
    userId: input.userId,
    type: 'party_use',
    amount: -usedPoint,
    balanceAfter,
    applicationId: input.applicationId,
    memo: '파티 신청 사용',
  })
  return { usedPoint }
}

/**
 * 거절·취소로 반환.
 *
 * 반환액은 `application.usedPoint`가 아니라 **이력에서 계산**한다 —
 * 취소를 두 번 시도해도 두 번 돌려주지 않기 위해서다.
 * 만료(expired)는 정상 이용을 마친 것이라 호출하지 않는다.
 */
export async function refundApplicationPoint(
  db: Db,
  input: { userId: string; applicationId: string; reason: string },
): Promise<{ refunded: number }> {
  const refundable = await findRefundableAmount(db, input.applicationId)
  if (refundable <= 0) return { refunded: 0 }

  const { pointBalance } = await incrementPoint(db, input.userId, refundable)
  await createPointTransaction(db, {
    userId: input.userId,
    type: 'party_refund',
    amount: refundable,
    balanceAfter: pointBalance,
    applicationId: input.applicationId,
    memo: input.reason,
  })
  return { refunded: refundable }
}
