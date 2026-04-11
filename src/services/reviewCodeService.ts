import { Prisma, ReviewCodeStatus } from '@prisma/client'
import {
  createReviewCode,
  createReviewCodes,
  deleteReviewCode,
  findReviewCodeById,
  findReviewCodes,
  updateReviewCode,
  updateReviewCodeStatus,
} from '../repositories/reviewCodeRepository'

export type GetReviewCodesInput = {
  status?: ReviewCodeStatus
  gameName?: string
  dateOrder: Prisma.SortOrder
  page: number
  pageSize: number
}

export type ReviewCodeFormInput = {
  gameName?: string
  code: string
}

export type ReviewCodeStatusInput = {
  status: ReviewCodeStatus
  usedBy?: string
}

export async function getReviewCodes(input: GetReviewCodesInput) {
  return findReviewCodes(input)
}

export type BatchReviewCodeInput = {
  gameName?: string
  codes: string[]
}

export async function createReviewCodeBatch(input: BatchReviewCodeInput) {
  const trimmedGameName = input.gameName?.trim() || undefined
  const dataList = input.codes.map((code) => ({
    gameName: trimmedGameName,
    code: code.trim(),
  }))
  const count = await createReviewCodes(dataList)
  return { count }
}

export async function createReviewCodeEntry(input: ReviewCodeFormInput) {
  return createReviewCode({
    gameName: input.gameName?.trim(),
    code: input.code.trim(),
  })
}

export async function updateReviewCodeEntry(id: string, input: ReviewCodeFormInput) {
  const existingReviewCode = await findReviewCodeById(id)

  if (!existingReviewCode) {
    throw Object.assign(new Error('리뷰 게임 코드를 찾을 수 없습니다.'), { statusCode: 404 })
  }

  return updateReviewCode(id, {
    gameName: input.gameName?.trim(),
    code: input.code.trim(),
  })
}

export async function updateReviewCodeEntryStatus(id: string, input: ReviewCodeStatusInput) {
  const existingReviewCode = await findReviewCodeById(id)

  if (!existingReviewCode) {
    throw Object.assign(new Error('리뷰 게임 코드를 찾을 수 없습니다.'), { statusCode: 404 })
  }

  if (input.status === 'used') {
    return updateReviewCodeStatus(id, {
      status: 'used',
      usedBy: input.usedBy?.trim() || null,
      usedAt: new Date(),
    })
  }

  return updateReviewCodeStatus(id, {
    status: 'unused',
    usedBy: null,
    usedAt: null,
  })
}

export async function deleteReviewCodeEntry(id: string) {
  const existingReviewCode = await findReviewCodeById(id)

  if (!existingReviewCode) {
    throw Object.assign(new Error('리뷰 게임 코드를 찾을 수 없습니다.'), { statusCode: 404 })
  }

  await deleteReviewCode(id)
}
