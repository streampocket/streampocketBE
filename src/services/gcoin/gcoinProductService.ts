import {
  createGcoinProduct,
  findAllGcoinProducts,
  findVisibleGcoinProducts,
  findGcoinProductById,
  updateGcoinProduct,
  softDeleteGcoinProductById,
  findMaxGcoinSortOrder,
} from '../../repositories/gcoin/gcoinProductRepository'
import { generateGcoinProductImagePresignedUrl } from '../../lib/s3'

type GcoinProductStatus = 'on_sale' | 'hidden' | 'sold_out'

type CreateInput = {
  name: string
  gcoinAmount: number
  salePrice: number
  listPrice?: number | null
  description?: string | null
  imageUrl?: string | null
  sortOrder?: number
  status?: GcoinProductStatus
}

type UpdateInput = {
  name?: string
  gcoinAmount?: number
  salePrice?: number
  listPrice?: number | null
  description?: string | null
  imageUrl?: string | null
  sortOrder?: number
  status?: GcoinProductStatus
}

type ListFilters = {
  status?: GcoinProductStatus
  search?: string
  page?: number
  pageSize?: number
}

/** 정가가 있으면 판매가보다 커야 한다 (같거나 작으면 할인 표시가 무의미) */
function assertPriceConsistency(salePrice: number, listPrice: number | null | undefined) {
  if (listPrice !== null && listPrice !== undefined && listPrice <= salePrice) {
    throw Object.assign(new Error('정가는 판매가보다 커야 합니다.'), { statusCode: 400 })
  }
}

export async function adminCreateGcoinProduct(input: CreateInput) {
  assertPriceConsistency(input.salePrice, input.listPrice)

  // 진열 순서 미입력 시 맨 뒤로 자동 배치
  const sortOrder = input.sortOrder ?? (await findMaxGcoinSortOrder()) + 1

  return createGcoinProduct({ ...input, sortOrder })
}

export async function adminGetGcoinProducts(filters: ListFilters) {
  const result = await findAllGcoinProducts(filters)

  if (filters.page && filters.pageSize) {
    return {
      data: result.items,
      total: result.total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: Math.ceil(result.total / filters.pageSize),
    }
  }

  return { data: result.items, total: result.total }
}

export async function adminGetGcoinProductDetail(id: string) {
  const product = await findGcoinProductById(id)
  if (!product || product.deletedAt) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return product
}

export async function adminUpdateGcoinProduct(id: string, data: UpdateInput) {
  const product = await adminGetGcoinProductDetail(id)

  const salePrice = data.salePrice ?? product.salePrice
  const listPrice = data.listPrice === undefined ? product.listPrice : data.listPrice
  assertPriceConsistency(salePrice, listPrice)

  return updateGcoinProduct(id, data)
}

export async function adminDeleteGcoinProduct(id: string) {
  await adminGetGcoinProductDetail(id)
  return softDeleteGcoinProductById(id)
}

export function issueGcoinProductImageUploadUrl(params: {
  contentType: string
  contentLength: number
}) {
  return generateGcoinProductImagePresignedUrl(params)
}

// ───────────────────────── 공개 (gcoin 사이트) ─────────────────────────

export async function getPublicGcoinProducts() {
  const items = await findVisibleGcoinProducts()
  return { data: items }
}

export async function getPublicGcoinProductDetail(id: string) {
  const product = await findGcoinProductById(id)
  if (!product || product.deletedAt || product.status === 'hidden') {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return product
}
