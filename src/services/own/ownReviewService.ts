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
  return { data: applications }
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
    select: { id: true, userId: true, status: true, productId: true },
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
    const review = await createReview({
      applicationId: input.applicationId,
      productId: application.productId,
      userId: input.userId,
      content: input.content,
      rating: input.rating,
      imageUrl: input.imageUrl,
    })
    return { data: review }
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

  await deleteReviewById(reviewId)

  if (existing.imageUrl) {
    await deleteReviewImage(existing.imageUrl).catch((err) => {
      // DB는 이미 삭제됐으므로 S3 실패는 로그만 남기고 통과한다.
      console.error('[review.delete] S3 이미지 삭제 실패:', err)
    })
  }
}
