import {
  findOwnCategoryByName,
  createOwnCategory,
} from '../../repositories/own/ownCategoryRepository'
import {
  createOwnProduct,
  findAllOwnProducts,
  findOwnProductById,
  updateOwnProduct,
  softDeleteOwnProductById,
  findOwnProductCredentialsById,
  findOwnProductWithApplications,
  findFullyExpiredProducts,
  bulkExpireProducts,
  findRecruitingStartedProducts,
  bulkCloseProducts,
} from '../../repositories/own/ownProductRepository'
import {
  findExpiredApplications,
  bulkExpireApplications,
} from '../../repositories/own/partyApplicationRepository'
import { encrypt, decrypt } from '../../utils/crypto'
import { sendDiscordAlert } from '../../lib/discord'
import { PARTY_TYPE_LABEL } from '../../constants/party'
import {
  calculateCurrentPrice,
  calculatePartyExpiresAt,
  getRemainingDays,
} from '../../utils/partyPricing'

type CreateInput = {
  name: string
  durationDays: number
  price: number
  dailyDiscount?: number
  totalSlots: number
  partyType?: 'personal' | 'shared'
  imagePath?: string | null
  notes?: string | null
  accountId?: string | null
  accountPassword?: string | null
  leaderName: string
}

type UpdateInput = {
  name?: string
  durationDays?: number
  price?: number
  dailyDiscount?: number
  totalSlots?: number
  partyType?: 'personal' | 'shared'
  imagePath?: string | null
  notes?: string | null
  accountId?: string | null
  accountPassword?: string | null
  leaderName?: string
}

function encryptField(value: string | null | undefined): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  return encrypt(value)
}

function stripCredentials<T extends { accountId?: string | null; accountPassword?: string | null }>(
  product: T,
): Omit<T, 'accountId' | 'accountPassword'> & { hasCredentials: boolean } {
  const { accountId, accountPassword, ...rest } = product
  return { ...rest, hasCredentials: accountId !== null && accountId !== undefined }
}

function enrichWithPricing<T extends { price: number; dailyDiscount: number; durationDays: number; startedAt: Date | null }>(
  product: T,
) {
  const currentPrice = calculateCurrentPrice(product)
  const partyExpiresAt = product.startedAt
    ? calculatePartyExpiresAt(product.startedAt, product.durationDays).toISOString()
    : null
  const remainingDays = product.startedAt
    ? Math.max(0, Math.floor(getRemainingDays(product.startedAt, product.durationDays)))
    : product.durationDays

  return { ...product, currentPrice, partyExpiresAt, remainingDays }
}

async function resolveCategoryByName(name: string): Promise<string> {
  const existing = await findOwnCategoryByName(name)
  if (existing) return existing.id
  const created = await createOwnCategory({ name })
  return created.id
}

type ListFilters = {
  categoryId?: string
  status?: 'recruiting' | 'closed' | 'expired'
  search?: string
  sort?: 'price_asc' | 'price_desc'
  page?: number
  pageSize?: number
  limit?: number
}

export async function createOwnProductItem(input: CreateInput) {
  const categoryId = await resolveCategoryByName(input.name)
  const product = await createOwnProduct({
    ...input,
    categoryId,
    accountId: encryptField(input.accountId) ?? null,
    accountPassword: encryptField(input.accountPassword) ?? null,
  })
  return enrichWithPricing(stripCredentials(product))
}

function sortByHasMembersThenOldest<T extends { filledSlots: number; createdAt: Date }>(
  items: T[],
): T[] {
  return [...items].sort((a, b) => {
    const aHas = a.filledSlots > 0 ? 1 : 0
    const bHas = b.filledSlots > 0 ? 1 : 0
    if (aHas !== bHas) return bHas - aHas
    return a.createdAt.getTime() - b.createdAt.getTime()
  })
}

export async function getOwnProducts(filters: ListFilters) {
  const result = await findAllOwnProducts(filters)
  // 가격 정렬은 currentPrice(동적 계산값) 기준이므로, 먼저 enrich 후 정렬한다.
  let items = result.items.map((item) => enrichWithPricing(stripCredentials(item)))

  if (filters.sort === 'price_asc' || filters.sort === 'price_desc') {
    const dir = filters.sort === 'price_asc' ? 1 : -1
    items = [...items].sort((a, b) => {
      if (a.currentPrice !== b.currentPrice) return (a.currentPrice - b.currentPrice) * dir
      return a.createdAt.getTime() - b.createdAt.getTime() // 동가 시 오래된순 tiebreaker
    })
  } else {
    items = sortByHasMembersThenOldest(items)
  }

  if (filters.limit) {
    items = items.slice(0, filters.limit)
  }

  const data = items

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

export async function getOwnProductDetail(id: string) {
  const product = await findOwnProductById(id)
  if (!product || product.deletedAt) {
    throw Object.assign(new Error('파티를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return enrichWithPricing(stripCredentials(product))
}

// 관리자용 (소유권 검증 없음)
export async function adminUpdateOwnProduct(id: string, data: UpdateInput) {
  const product = await findOwnProductById(id)
  if (!product) {
    throw Object.assign(new Error('파티를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (data.totalSlots !== undefined && data.totalSlots < product.filledSlots) {
    throw Object.assign(
      new Error('모집 총인원은 현재 모집된 인원보다 작을 수 없습니다.'),
      { statusCode: 400 },
    )
  }
  const updateData: Record<string, unknown> = { ...data }
  if (data.name) {
    updateData.categoryId = await resolveCategoryByName(data.name)
  }
  if (data.accountId !== undefined) {
    updateData.accountId = encryptField(data.accountId) ?? null
  }
  if (data.accountPassword !== undefined) {
    updateData.accountPassword = encryptField(data.accountPassword) ?? null
  }
  const updated = await updateOwnProduct(id, updateData)
  return enrichWithPricing(stripCredentials(updated))
}

export async function adminDeleteOwnProduct(id: string) {
  const product = await findOwnProductById(id)
  if (!product) {
    throw Object.assign(new Error('파티를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return softDeleteOwnProductById(id)
}

export async function adminGetOwnProductDetailWithApplications(id: string) {
  const product = await findOwnProductWithApplications(id)
  if (!product) {
    throw Object.assign(new Error('파티를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return enrichWithPricing(stripCredentials(product))
}

export async function adminGetOwnProductCredentials(id: string) {
  const record = await findOwnProductCredentialsById(id)
  if (!record) {
    throw Object.assign(new Error('파티를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return {
    accountId: record.accountId ? decrypt(record.accountId) : null,
    accountPassword: record.accountPassword ? decrypt(record.accountPassword) : null,
  }
}

export async function adminUpdatePartyStatus(id: string, status: 'recruiting' | 'closed' | 'expired') {
  const product = await findOwnProductById(id)
  if (!product) {
    throw Object.assign(new Error('파티를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  const updated = await updateOwnProduct(id, { status })
  return enrichWithPricing(stripCredentials(updated))
}

export async function expireOldParties() {
  // 1단계: 만료 대상 파티원 처리
  const expiredApps = await findExpiredApplications()
  let expiredAppCount = 0

  if (expiredApps.length > 0) {
    const ids = expiredApps.map((a) => a.id)
    await bulkExpireApplications(ids)
    expiredAppCount = ids.length

    const details = expiredApps
      .map((a) => `- [${PARTY_TYPE_LABEL[a.product.partyType]}] ${a.product.name}: ${a.user.name}`)
      .join('\n')

    sendDiscordAlert(
      'partyApply',
      `**파티원 자동 만료:** ${expiredAppCount}명의 파티원이 만료 처리되었습니다.\n${details}`,
    ).catch(() => {})
  }

  // 2단계: 남은 기간 1일 이하인 recruiting 파티 → closed 처리
  const recruitingProducts = await findRecruitingStartedProducts()
  const nearExpiration = recruitingProducts.filter((p) => {
    if (!p.startedAt) return false
    return getRemainingDays(p.startedAt, p.durationDays) <= 1
  })
  let closedPartyCount = 0

  if (nearExpiration.length > 0) {
    await bulkCloseProducts(nearExpiration.map((p) => p.id))
    closedPartyCount = nearExpiration.length

    sendDiscordAlert(
      'partyApply',
      `**파티 자동 마감:** ${closedPartyCount}개 파티가 남은 기간 1일 이하로 마감되었습니다.\n${nearExpiration.map((p) => `- [${PARTY_TYPE_LABEL[p.partyType]}] ${p.name}`).join('\n')}`,
    ).catch(() => {})
  }

  // 3단계: 모든 파티원이 만료/취소된 파티 → 파티 자체 expired 처리
  const fullyExpired = await findFullyExpiredProducts()
  let expiredPartyCount = 0

  if (fullyExpired.length > 0) {
    await bulkExpireProducts(fullyExpired.map((p) => p.id))
    expiredPartyCount = fullyExpired.length
  }

  return { expiredAppCount, closedPartyCount, expiredPartyCount }
}
