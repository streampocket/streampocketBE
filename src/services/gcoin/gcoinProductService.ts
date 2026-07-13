import type { GcoinProduct } from '@prisma/client'
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
import { getUsdKrwRate, toKrwListPrice } from './exchangeRateService'

type GcoinProductStatus = 'on_sale' | 'hidden' | 'sold_out'
type GcoinProductCategory = 'gcoin' | 'item'

type CreateInput = {
  name: string
  category: GcoinProductCategory
  gcoinAmount?: number | null
  salePrice: number
  listPrice?: number | null
  listPriceUsd?: number | null
  description?: string | null
  imageUrl?: string | null
  sortOrder?: number
  status?: GcoinProductStatus
}

type UpdateInput = {
  name?: string
  category?: GcoinProductCategory
  gcoinAmount?: number | null
  salePrice?: number
  listPrice?: number | null
  listPriceUsd?: number | null
  description?: string | null
  imageUrl?: string | null
  sortOrder?: number
  status?: GcoinProductStatus
}

type ListFilters = {
  status?: GcoinProductStatus
  category?: GcoinProductCategory
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

/** 지코인 상품은 수량 필수, 아이템 상품은 수량 없음(null 강제) */
function resolveGcoinAmount(
  category: GcoinProductCategory,
  gcoinAmount: number | null | undefined,
): number | null {
  if (category === 'item') return null
  if (gcoinAmount === null || gcoinAmount === undefined) {
    throw Object.assign(new Error('지코인 상품은 지코인 수량이 필요합니다.'), { statusCode: 400 })
  }
  return gcoinAmount
}

/** 달러 정가는 지코인 카테고리 전용 (아이템은 null 강제). 소수 2자리로 정규화 */
function resolveListPriceUsd(
  category: GcoinProductCategory,
  listPriceUsd: number | null | undefined,
): number | null {
  if (category === 'item') return null
  if (listPriceUsd === null || listPriceUsd === undefined) return null
  return Math.round(listPriceUsd * 100) / 100
}

/** 달러 정가의 원화 환산액도 판매가보다 커야 한다. 환율 미확보 시 검증 생략 (표시 단계 가드가 방어) */
function assertUsdListPriceConsistency(
  listPriceUsd: number | null,
  salePrice: number,
  rate: number | null,
) {
  if (listPriceUsd === null || rate === null) return
  if (toKrwListPrice(listPriceUsd, rate) <= salePrice) {
    throw Object.assign(new Error('달러 정가의 원화 환산액이 판매가보다 커야 합니다.'), {
      statusCode: 400,
    })
  }
}

type GcoinProductResponse = Omit<GcoinProduct, 'listPriceUsd'> & {
  listPriceUsd: number | null
}

/**
 * 응답 매핑 — 달러 정가가 있으면 listPrice를 환율 환산값(100원 단위)으로 덮어쓴다.
 * 환산값이 판매가 이하로 떨어지면(환율 하락) 할인 표시가 무의미하므로 null 처리.
 * Prisma Decimal은 JSON에서 문자열이 되므로 여기서 number로 변환한다.
 */
function toGcoinProductResponse(product: GcoinProduct, rate: number | null): GcoinProductResponse {
  const listPriceUsd = product.listPriceUsd !== null ? Number(product.listPriceUsd) : null

  let listPrice = product.listPrice
  if (listPriceUsd !== null && rate !== null) {
    const converted = toKrwListPrice(listPriceUsd, rate)
    listPrice = converted > product.salePrice ? converted : null
  }

  return { ...product, listPriceUsd, listPrice }
}

export async function adminCreateGcoinProduct(input: CreateInput) {
  assertPriceConsistency(input.salePrice, input.listPrice)
  const gcoinAmount = resolveGcoinAmount(input.category, input.gcoinAmount)
  const listPriceUsd = resolveListPriceUsd(input.category, input.listPriceUsd)

  const rate = await getUsdKrwRate()
  assertUsdListPriceConsistency(listPriceUsd, input.salePrice, rate)

  // 진열 순서 미입력 시 맨 뒤로 자동 배치
  const sortOrder = input.sortOrder ?? (await findMaxGcoinSortOrder()) + 1

  const created = await createGcoinProduct({ ...input, gcoinAmount, listPriceUsd, sortOrder })
  return toGcoinProductResponse(created, rate)
}

export async function adminGetGcoinProducts(filters: ListFilters) {
  const [result, rate] = await Promise.all([findAllGcoinProducts(filters), getUsdKrwRate()])
  const data = result.items.map((item) => toGcoinProductResponse(item, rate))

  if (filters.page && filters.pageSize) {
    return {
      data,
      total: result.total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages: Math.ceil(result.total / filters.pageSize),
    }
  }

  return { data, total: result.total }
}

async function getGcoinProductEntityOrThrow(id: string): Promise<GcoinProduct> {
  const product = await findGcoinProductById(id)
  if (!product || product.deletedAt) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return product
}

export async function adminGetGcoinProductDetail(id: string) {
  const product = await getGcoinProductEntityOrThrow(id)
  return toGcoinProductResponse(product, await getUsdKrwRate())
}

export async function adminUpdateGcoinProduct(id: string, data: UpdateInput) {
  const product = await getGcoinProductEntityOrThrow(id)
  const rate = await getUsdKrwRate()

  const salePrice = data.salePrice ?? product.salePrice
  const listPrice = data.listPrice === undefined ? product.listPrice : data.listPrice
  assertPriceConsistency(salePrice, listPrice)

  // 변경 후 기준 카테고리-수량·달러 정가 정합성 검증 (아이템이면 null 강제)
  const category = data.category ?? product.category
  const mergedAmount = data.gcoinAmount === undefined ? product.gcoinAmount : data.gcoinAmount
  const gcoinAmount = resolveGcoinAmount(category, mergedAmount)

  const existingUsd = product.listPriceUsd !== null ? Number(product.listPriceUsd) : null
  const mergedUsd = data.listPriceUsd === undefined ? existingUsd : data.listPriceUsd
  const listPriceUsd = resolveListPriceUsd(category, mergedUsd)
  assertUsdListPriceConsistency(listPriceUsd, salePrice, rate)

  const updated = await updateGcoinProduct(id, { ...data, gcoinAmount, listPriceUsd })
  return toGcoinProductResponse(updated, rate)
}

export async function adminDeleteGcoinProduct(id: string) {
  await getGcoinProductEntityOrThrow(id)
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
  const [items, rate] = await Promise.all([findVisibleGcoinProducts(), getUsdKrwRate()])
  return { data: items.map((item) => toGcoinProductResponse(item, rate)) }
}

export async function getPublicGcoinProductDetail(id: string) {
  const product = await findGcoinProductById(id)
  if (!product || product.deletedAt || product.status === 'hidden') {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return toGcoinProductResponse(product, await getUsdKrwRate())
}
