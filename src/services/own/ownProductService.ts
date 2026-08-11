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
import { sendDiscordAlert } from '../../lib/discord'
import { PARTY_TYPE_LABEL } from '../../constants/party'
import { PARTY_APPLICATION_FEE } from '../../constants/fees'
import { WITHDRAWN_USER_DISPLAY } from './userWithdrawalService'
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
  durationMode?: 'countdown' | 'fixed'
  imagePath?: string | null
  notes?: string | null
  leaderName: string
}

type UpdateInput = {
  name?: string
  durationDays?: number
  price?: number
  dailyDiscount?: number
  totalSlots?: number
  partyType?: 'personal' | 'shared'
  durationMode?: 'countdown' | 'fixed'
  imagePath?: string | null
  notes?: string | null
  leaderName?: string
}

// 파티 공유계정 기능은 제거됐지만 DB 컬럼(accountId/accountPassword)은 데이터 보존을 위해 남아 있다.
// 조회 결과에 실려오는 legacy 암호문이 API 응답으로 노출되지 않도록 계속 걸러낸다.
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

  // 신청 수수료를 함께 내려준다 — 화면이 "결제 예정 금액"을 계산하려면 필요한데,
  // fe에 상수를 복제하면 값이 바뀔 때 갈라진다. 단일 출처(constants/fees.ts)를 그대로 전달한다.
  return {
    ...product,
    currentPrice,
    applicationFee: PARTY_APPLICATION_FEE,
    partyExpiresAt,
    remainingDays,
  }
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
  // 완전 삭제(purge)된 회원의 신청은 익명 표시로 대체 — FE가 user.name/phone을 직접 참조
  const withDisplayUsers = {
    ...product,
    applications: product.applications.map((app) => ({
      ...app,
      user: app.user ?? WITHDRAWN_USER_DISPLAY,
    })),
  }
  return enrichWithPricing(stripCredentials(withDisplayUsers))
}

// 동일 파티 복제 생성 — 설정 필드 전부 복사, 모집 상태(filledSlots/status/startedAt)는
// create 시 전달하지 않아 스키마 @default(0/recruiting/null)로 초기화된다.
// 카테고리는 이름 재해석(resolveCategoryByName) 대신 원본 categoryId를 그대로 복사한다
// — 카테고리명과 파티명이 다른 경우 이름 해석이 엉뚱한 새 카테고리를 만들 수 있기 때문.
// 파티 마감(모집완료) 직후 "똑같은 파티 재생성" 확인에서 호출된다.
export async function duplicateOwnProductItem(id: string) {
  const original = await findOwnProductById(id)
  if (!original || original.deletedAt) {
    throw Object.assign(new Error('파티를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  const product = await createOwnProduct({
    name: original.name,
    categoryId: original.categoryId,
    durationDays: original.durationDays,
    price: original.price,
    dailyDiscount: original.dailyDiscount,
    totalSlots: original.totalSlots,
    partyType: original.partyType,
    durationMode: original.durationMode,
    imagePath: original.imagePath,
    notes: original.notes,
    leaderName: original.leaderName,
  })
  return enrichWithPricing(stripCredentials(product))
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
      .map((a) => `- [${PARTY_TYPE_LABEL[a.product.partyType]}] ${a.product.name}: ${a.user?.name ?? '탈퇴한 회원'}`)
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
