import { CodeStatus } from '@prisma/client'
import {
  listCodes,
  bulkCreateCodes,
  disableCode as disableCodeRepo,
  countAvailableCodes,
} from '../repositories/steamCodeRepository'
import { findProductById } from '../repositories/steamProductRepository'

type ListCodesInput = {
  productId?: string
  status?: CodeStatus
  page: number
  pageSize: number
}

type BulkCreateInput = {
  productId: string
  codes: string[]
}

export async function getCodes(input: ListCodesInput) {
  return listCodes(input)
}

export async function bulkCreate(input: BulkCreateInput) {
  const product = await findProductById(input.productId)
  if (!product) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  const count = await bulkCreateCodes(input.productId, input.codes)
  const available = await countAvailableCodes(input.productId)
  return { created: count, availableTotal: available }
}

export async function disable(id: string) {
  return disableCodeRepo(id)
}
