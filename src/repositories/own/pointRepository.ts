import { prisma } from '../../lib/prisma'
import type { PointTransactionType, Prisma } from '@prisma/client'

// 포인트는 파티 신청 트랜잭션 안에서 차감돼야 한다(신청은 생겼는데 포인트가 안 깎이는 상태 금지).
// 그래서 모든 함수가 트랜잭션 클라이언트를 받는다. 단독 호출은 prisma를 그대로 넘기면 된다.
type Db = Prisma.TransactionClient | typeof prisma

export function findUserPointBalance(db: Db, userId: string): Promise<number | null> {
  return db.user
    .findUnique({ where: { id: userId }, select: { pointBalance: true } })
    .then((row) => row?.pointBalance ?? null)
}

/**
 * 잔액이 충분할 때만 깎는다.
 *
 * 조회 후 비교하면 그 사이에 다른 요청이 끼어들어 잔액이 음수가 될 수 있다.
 * where에 `pointBalance >= amount`를 얹어 **DB가 판정**하게 한다.
 * 깎지 못했으면 false — 호출측이 409로 옮긴다.
 */
export async function decrementPointIfEnough(
  db: Db,
  userId: string,
  amount: number,
): Promise<boolean> {
  if (amount <= 0) return true
  const { count } = await db.user.updateMany({
    where: { id: userId, pointBalance: { gte: amount } },
    data: { pointBalance: { decrement: amount } },
  })
  return count > 0
}

/** 적립 — 잔액에 더한다 */
export function incrementPoint(db: Db, userId: string, amount: number) {
  return db.user.update({
    where: { id: userId },
    data: { pointBalance: { increment: amount } },
    select: { pointBalance: true },
  })
}

/**
 * 회수 — 잔액이 모자라도 음수로 만들지 않고 0까지만 깎는다.
 * 음수 잔액은 신청 화면의 사용 가능액 계산을 전부 어지럽힌다.
 * 실제로 깎인 양을 돌려준다(이력에 남길 값).
 */
export async function decrementPointToZero(
  db: Db,
  userId: string,
  amount: number,
): Promise<{ revoked: number; balanceAfter: number }> {
  const user = await db.user.findUnique({ where: { id: userId }, select: { pointBalance: true } })
  const current = user?.pointBalance ?? 0
  const revoked = Math.min(current, Math.max(0, amount))
  if (revoked === 0) return { revoked: 0, balanceAfter: current }

  const updated = await db.user.update({
    where: { id: userId },
    data: { pointBalance: { decrement: revoked } },
    select: { pointBalance: true },
  })
  return { revoked, balanceAfter: updated.pointBalance }
}

type CreateTransactionInput = {
  userId: string
  type: PointTransactionType
  /** 적립 양수 / 차감 음수 */
  amount: number
  balanceAfter: number
  reviewId?: string | null
  applicationId?: string | null
  memo?: string | null
}

export function createPointTransaction(db: Db, input: CreateTransactionInput) {
  return db.pointTransaction.create({
    data: {
      userId: input.userId,
      type: input.type,
      amount: input.amount,
      balanceAfter: input.balanceAfter,
      reviewId: input.reviewId ?? null,
      applicationId: input.applicationId ?? null,
      memo: input.memo ?? null,
    },
  })
}

/** 같은 리뷰에 이미 지급했는지 — 관리자가 리뷰를 지우고 재작성해도 두 번 주지 않기 위한 판정 */
export async function hasReviewReward(db: Db, reviewId: string): Promise<boolean> {
  const found = await db.pointTransaction.findFirst({
    where: { reviewId, type: 'review_reward' },
    select: { id: true },
  })
  return found !== null
}

/** 그 리뷰로 실제 지급된 금액 (회수할 때 쓴다). 지급 이력이 없으면 0 */
export async function findReviewRewardAmount(db: Db, reviewId: string): Promise<number> {
  const found = await db.pointTransaction.findFirst({
    where: { reviewId, type: 'review_reward' },
    select: { amount: true },
    orderBy: { createdAt: 'desc' },
  })
  return found?.amount ?? 0
}

/**
 * 그 신청에서 아직 반환되지 않은 사용액.
 *
 * `application.usedPoint`를 그대로 믿지 않고 이력으로 계산한다 —
 * 취소를 두 번 시도해도 두 번 반환되지 않게 하려면 "이미 얼마 돌려줬는지"가 필요하다.
 */
export async function findRefundableAmount(db: Db, applicationId: string): Promise<number> {
  const rows = await db.pointTransaction.findMany({
    where: { applicationId, type: { in: ['party_use', 'party_refund'] } },
    select: { type: true, amount: true },
  })

  let used = 0
  let refunded = 0
  for (const row of rows) {
    if (row.type === 'party_use') used += Math.abs(row.amount)
    else refunded += Math.abs(row.amount)
  }
  return Math.max(0, used - refunded)
}
