import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'
import {
  createReview,
  deleteReviewById,
  findReviewableApplications,
  findReviewById,
  findReviewByIdForPublic,
  findReviewsForAdmin,
  findReviewsForPublic,
  updateReview,
  type ReviewListSort,
} from '../../repositories/own/ownReviewRepository'
import {
  deleteReviewImage,
  generateReviewImagePresignedUrl,
} from '../../lib/s3'
import { WITHDRAWN_USER_DISPLAY } from './userWithdrawalService'
import { grantReviewReward, resolveReviewReward, revokeReviewReward } from './pointService'
import { getReviewPointTiers } from '../systemSettingsService'

// 완전 삭제(purge)된 회원의 리뷰는 익명 표시로 대체 — FE가 user.name을 직접 참조
function withDisplayUser<T extends { user: object | null }>(review: T) {
  return { ...review, user: review.user ?? WITHDRAWN_USER_DISPLAY }
}

type ListInput = {
  productId?: string
  categoryId?: string
  sort: ReviewListSort
  page: number
  pageSize: number
}

export async function listReviews(input: ListInput) {
  const { items, total } = await findReviewsForPublic(input)
  return {
    data: {
      items: items.map(withDisplayUser),
      total,
      page: input.page,
      pageSize: input.pageSize,
      totalPages: Math.ceil(total / input.pageSize),
    },
  }
}

export async function getReview(id: string) {
  const review = await findReviewByIdForPublic(id)
  if (!review) {
    throw Object.assign(new Error('리뷰를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return { data: withDisplayUser(review) }
}

export async function getReviewableApplications(userId: string) {
  const applications = await findReviewableApplications(userId)

  // 구간이 3개라 "리뷰 쓰면 300P"라고 뭉뚱그리면 100P 받는 사람에게는 틀린 말이 된다.
  // 신청마다 실제 지급될 금액을 서버가 계산해 내려준다 — 판정 규칙을 fe에 복제하지 않는다.
  const tiers = await getReviewPointTiers()
  const data = applications.map((application) => ({
    ...application,
    rewardPoint: resolveReviewReward(
      Math.max(0, application.totalAmount - application.usedPoint),
      tiers,
    ),
  }))

  return { data }
}

export async function issueReviewImageUploadUrl(input: {
  userId: string
  contentType: string
  contentLength: number
}) {
  const result = await generateReviewImagePresignedUrl(input)
  return { data: result }
}

type CreateInput = {
  applicationId: string
  userId: string
  content: string
  rating: number
  imageUrl: string | null
}

export async function createReviewForUser(input: CreateInput) {
  const application = await prisma.partyApplication.findUnique({
    where: { id: input.applicationId },
    // totalAmount·usedPoint는 적립 구간 판정용 — 기준이 실결제액(총액 − 사용 포인트)이다
    select: {
      id: true,
      userId: true,
      status: true,
      productId: true,
      totalAmount: true,
      usedPoint: true,
    },
  })
  if (!application) {
    throw Object.assign(new Error('파티 신청 내역을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (application.userId !== input.userId) {
    throw Object.assign(new Error('본인의 파티 신청에만 리뷰를 작성할 수 있습니다.'), {
      statusCode: 403,
      code: 'FORBIDDEN',
    })
  }
  if (application.status !== 'confirmed') {
    throw Object.assign(new Error('참여 확정된 파티에만 리뷰를 작성할 수 있습니다.'), {
      statusCode: 403,
      code: 'NOT_CONFIRMED_MEMBER',
    })
  }

  try {
    // 리뷰 저장과 적립을 한 트랜잭션으로 묶는다 — 리뷰만 저장되고 적립이 실패하면
    // 사용자에겐 실패로 보이는데 다시 쓰려 하면 409(이미 작성함)가 되어 손쓸 방법이 없다.
    const { review, granted } = await prisma.$transaction(async (tx) => {
      const created = await createReview(
        {
          applicationId: input.applicationId,
          productId: application.productId,
          userId: input.userId,
          content: input.content,
          rating: input.rating,
          imageUrl: input.imageUrl,
        },
        tx,
      )

      // 적립 기준은 실결제액(총액 − 사용 포인트)이다. 총액 기준이면 포인트로 산 건에
      // 또 포인트가 붙어 계속 불어난다. 같은 리뷰에 두 번 주지 않는 판정은 pointService가 한다.
      const paidAmount = Math.max(0, application.totalAmount - application.usedPoint)
      const result = await grantReviewReward(tx, {
        userId: input.userId,
        reviewId: created.id,
        paidAmount,
      })

      return { review: created, granted: result.granted }
    })

    return { data: { ...review, grantedPoint: granted } }
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw Object.assign(new Error('이미 이 파티에 작성한 리뷰가 있습니다.'), {
        statusCode: 409,
        code: 'REVIEW_ALREADY_EXISTS',
      })
    }
    throw e
  }
}

type UpdateInput = {
  reviewId: string
  userId: string
  content: string
  rating: number
  imageUrl: string | null
}

export async function updateReviewForUser(input: UpdateInput) {
  const existing = await findReviewById(input.reviewId)
  if (!existing) {
    throw Object.assign(new Error('리뷰를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (existing.userId !== input.userId) {
    throw Object.assign(new Error('본인 작성한 리뷰만 수정할 수 있습니다.'), {
      statusCode: 403,
      code: 'FORBIDDEN',
    })
  }

  // 이미지가 교체되었거나 제거된 경우 기존 S3 객체 정리.
  const shouldRemoveOldImage =
    existing.imageUrl !== null && existing.imageUrl !== input.imageUrl

  const updated = await updateReview(input.reviewId, {
    content: input.content,
    rating: input.rating,
    imageUrl: input.imageUrl,
  })

  if (shouldRemoveOldImage && existing.imageUrl) {
    await deleteReviewImage(existing.imageUrl).catch((err) => {
      console.error('[review.update] 기존 S3 이미지 삭제 실패:', err)
    })
  }

  return { data: updated }
}

// ─────────────── 관리자용 ───────────────

type AdminListInput = {
  search?: string
  categoryId?: string
  rating?: number
  page: number
  pageSize: number
}

export async function adminListReviews(input: AdminListInput) {
  const { items, total } = await findReviewsForAdmin(input)
  return {
    data: {
      items: items.map(withDisplayUser),
      total,
      page: input.page,
      pageSize: input.pageSize,
      totalPages: Math.ceil(total / input.pageSize),
    },
  }
}

export async function adminDeleteReview(reviewId: string) {
  const existing = await findReviewById(reviewId)
  if (!existing) {
    throw Object.assign(new Error('리뷰를 찾을 수 없습니다.'), { statusCode: 404 })
  }

  // 지급했던 포인트를 회수한 뒤 지운다 — 순서가 반대면 리뷰가 사라져 지급 이력을 못 찾는다.
  // 이미 써버려 잔액이 모자라면 0까지만 깎는다(음수 잔액 금지).
  // 탈퇴로 익명화된 리뷰(userId null)는 회수 대상이 없다.
  if (existing.userId) {
    await revokeReviewReward(prisma, { userId: existing.userId, reviewId })
  }

  await deleteReviewById(reviewId)

  if (existing.imageUrl) {
    await deleteReviewImage(existing.imageUrl).catch((err) => {
      // DB는 이미 삭제됐으므로 S3 실패는 로그만 남기고 통과한다.
      console.error('[review.delete] S3 이미지 삭제 실패:', err)
    })
  }
}
