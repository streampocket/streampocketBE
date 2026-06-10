import { ProductStatus, SteamProductType, Store } from '@prisma/client'
import {
  findAllProducts,
  findProductById,
  findProductByNaverId,
  findAllNaverProductIds,
  findActiveNaverProductIds,
  findProductFieldsByNaverIds,
  bulkDeleteProductsByNaverIds,
  countProductsByStatus,
  createProduct,
  updateProduct,
  updateProductByNaverId,
  deleteProductById,
} from '../repositories/steamProductRepository'
import { bulkDisableByProductIds } from '../repositories/steamAccountRepository'
import { fetchNaverProducts } from './platform/naverOrderSource'
import {
  findGamesForMatching,
  createGame,
  GameForMatching,
} from '../repositories/steamGameRepository'
import {
  findListingByNaverProductId,
  createListing,
  updateListingFields,
  findNaverProductIdsByStore,
  deleteListingsByNaverProductIds,
} from '../repositories/storeListingRepository'
import { detectProductType } from '../utils/productType'
import { STORES, STORE_LABELS } from '../constants/stores'
import { sendDiscordAlert } from '../lib/discord'

type CreateProductInput = {
  name: string
  naverProductId: string
}

type UpdateProductInput = {
  name?: string
  status?: ProductStatus
}

type GetProductsInput = {
  status?: ProductStatus
  search?: string
  page: number
  pageSize: number
}

export async function getProducts(input: GetProductsInput) {
  const { data, total } = await findAllProducts(input)
  const items = data.map(({ _count, ...rest }) => ({ ...rest, stockCount: _count.accounts }))
  const totalPages = total === 0 ? 1 : Math.ceil(total / input.pageSize)
  return {
    data: items,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages,
  }
}

export async function getProductCounts(search?: string) {
  return countProductsByStatus(search)
}

export async function getProductDetail(id: string) {
  const product = await findProductById(id)
  if (!product) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  const { _count, ...rest } = product
  return { ...rest, stockCount: _count.accounts }
}

export async function createSteamProduct(input: CreateProductInput) {
  const existing = await findProductByNaverId(input.naverProductId)
  if (existing) {
    throw Object.assign(new Error('이미 등록된 네이버 상품 ID입니다.'), { statusCode: 409 })
  }
  return createProduct(input)
}

export async function updateSteamProduct(id: string, input: UpdateProductInput) {
  const product = await findProductById(id)
  if (!product) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  // 상품 inactive 처리 시 연결된 available/reserved 계정도 disabled
  if (input.status === 'inactive') {
    await bulkDisableByProductIds([id])
  }
  return updateProduct(id, input)
}

export async function deleteSteamProduct(id: string): Promise<void> {
  const product = await findProductById(id)
  if (!product) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  await deleteProductById(id)
}

type NaverProduct = {
  productId: string
  name: string
  price: number | null
  discountPricePc: number | null
  discountPriceMobile: number | null
  naverSaleStatus: string | null
}

export type StoreSyncResult = {
  store: Store
  created: number
  updated: number
  deleted: number
  gamesCreated: number
  legacy: { created: number; updated: number; deleted: number } | null
}

// 게임 매칭 정규화 키 — 두 스토어가 같은 게임을 다른 상품명으로 등록해도 같은 키로 수렴시킨다.
// 스토어 간 "차이나는 표현"(언어/등록방식)과 대괄호 주석만 제거하고, 에디션·핵심 게임명은 보존.
// 리뷰게임 표기는 "(게임 1+N)" / "리뷰게임 N개" 모두 공통 토큰 "리뷰게임N"으로 수렴 (개수 보존 — 1+3과 1+7은 분리 유지).
// 끝의 ' na'/' aa' 접미사도 제거(배그 'bg'는 유지). 검증: 포켓 221개 전부 스트림 게임에 매칭, 스트림 collapse 0.
const NAME_NOISE_TOKENS = [
  '한국어',
  '한글판',
  '내계정에등록',
  '자기계정등록',
  '모든계정등록',
  '본인계정등록',
  '신규계정',
  '자기계정',
  '내계정',
  '본인계정',
  '기존계정',
]

export function normalizeGameName(name: string): string {
  let s = name.trim().toLowerCase().replace(/\s+/g, ' ')
  // 대괄호 주석 제거: [본인계정], [기존계정] 등
  s = s.replace(/\[[^\]]*\]/g, ' ')
  // 스토어 간 차이나는 노이즈 토큰(언어/등록방식) 제거
  for (const token of NAME_NOISE_TOKENS) {
    s = s.split(token).join(' ')
  }
  // 리뷰게임 표기 정규화 — "(게임 1+3)" / "게임 1+3" / "1+3" / "리뷰게임 3개" → "리뷰게임3"
  s = s.replace(/\(\s*(?:게임\s*)?\d+\s*\+\s*(\d+)\s*\)/g, ' 리뷰게임$1 ') // 괄호형 먼저 (괄호 잔존 방지)
  s = s.replace(/(?:게임\s*)?\d+\s*\+\s*(\d+)/g, ' 리뷰게임$1 ')
  s = s.replace(/리뷰\s*게임\s*(\d+)\s*개/g, ' 리뷰게임$1 ')
  s = s.replace(/\s+/g, ' ').trim()
  s = s.replace(/\s(na|aa)$/u, '').trim()
  return s
}

function parseGameType(name: string): SteamProductType {
  return detectProductType(name) ?? 'NA'
}

type MatchEntry = { id: string; occupied: Set<Store> }

function buildGameIndex(games: GameForMatching[]): Map<string, MatchEntry[]> {
  const index = new Map<string, MatchEntry[]>()
  for (const g of games) {
    const key = normalizeGameName(g.name)
    const entry: MatchEntry = { id: g.id, occupied: new Set(g.listings.map((l) => l.store)) }
    const arr = index.get(key)
    if (arr) arr.push(entry)
    else index.set(key, [entry])
  }
  return index
}

function addToGameIndex(
  index: Map<string, MatchEntry[]>,
  name: string,
  gameId: string,
  store: Store,
): void {
  const key = normalizeGameName(name)
  const entry: MatchEntry = { id: gameId, occupied: new Set<Store>([store]) }
  const arr = index.get(key)
  if (arr) arr.push(entry)
  else index.set(key, [entry])
}

// 해당 스토어에 아직 리스팅이 없는 동일 정규화명 게임을 찾는다(없으면 null → 신규 게임 생성).
function matchGameForStore(
  index: Map<string, MatchEntry[]>,
  name: string,
  store: Store,
): MatchEntry | null {
  const arr = index.get(normalizeGameName(name))
  if (!arr) return null
  return arr.find((e) => !e.occupied.has(store)) ?? null
}

// 레거시 브리지 — 기존 SteamProduct 유지(스트림포켓 한정). 기존 동기화 로직을 그대로 보존해
// 주문 처리(steamFulfillmentService)가 변경 없이 동작하게 한다.
async function syncLegacySteamProducts(
  naverProducts: NaverProduct[],
): Promise<{ created: number; updated: number; deleted: number }> {
  const [existingIds, activeIds] = await Promise.all([
    findAllNaverProductIds(),
    findActiveNaverProductIds(),
  ])

  const existingSet = new Set(existingIds)
  const newProducts = naverProducts.filter((p) => !existingSet.has(p.productId))
  await Promise.all(
    newProducts.map((p) =>
      createProduct({
        name: p.name,
        naverProductId: p.productId,
        price: p.price,
        discountPricePc: p.discountPricePc,
        discountPriceMobile: p.discountPriceMobile,
      }),
    ),
  )

  const existingNaverIds = naverProducts
    .filter((p) => existingSet.has(p.productId))
    .map((p) => p.productId)
  const dbProducts = await findProductFieldsByNaverIds(existingNaverIds)
  const dbFieldMap = new Map(
    dbProducts.map((p) => [
      p.naverProductId,
      {
        name: p.name,
        price: p.price,
        discountPricePc: p.discountPricePc,
        discountPriceMobile: p.discountPriceMobile,
      },
    ]),
  )
  const toUpdate = naverProducts.filter((p) => {
    const existing = dbFieldMap.get(p.productId)
    if (!existing) return false
    return (
      existing.name !== p.name ||
      existing.price !== p.price ||
      existing.discountPricePc !== p.discountPricePc ||
      existing.discountPriceMobile !== p.discountPriceMobile
    )
  })
  await Promise.all(
    toUpdate.map((p) =>
      updateProductByNaverId(p.productId, {
        name: p.name,
        price: p.price,
        discountPricePc: p.discountPricePc,
        discountPriceMobile: p.discountPriceMobile,
      }),
    ),
  )

  const naverSet = new Set(naverProducts.map((p) => p.productId))
  const toDelete = activeIds.filter((id) => !naverSet.has(id))
  let deleted = 0
  if (toDelete.length > 0) {
    deleted = await bulkDeleteProductsByNaverIds(toDelete)
  }

  return { created: newProducts.length, updated: toUpdate.length, deleted }
}

// 새 모델 동기화 — 스토어별 리스팅 upsert + 게임 매칭/생성.
async function syncStoreListings(
  store: Store,
  naverProducts: NaverProduct[],
): Promise<{ created: number; updated: number; deleted: number; gamesCreated: number }> {
  const index = buildGameIndex(await findGamesForMatching())
  let created = 0
  let updated = 0
  let gamesCreated = 0
  const seen = new Set<string>()

  for (const np of naverProducts) {
    seen.add(np.productId)
    const existing = await findListingByNaverProductId(np.productId)
    if (existing) {
      await updateListingFields(existing.id, {
        price: np.price,
        discountPricePc: np.discountPricePc,
        discountPriceMobile: np.discountPriceMobile,
        naverSaleStatus: np.naverSaleStatus,
      })
      updated += 1
      continue
    }

    let gameId: string
    if (store === 'streampocket') {
      // 레거시 단계에서 생성된 SteamProduct id 를 게임 id 로 재사용 →
      // 계정(game_id = product_id)과 게임이 일치해 재고 표시가 정확해진다.
      const product = await findProductByNaverId(np.productId)
      const game = await createGame({
        id: product?.id,
        name: np.name,
        productType: parseGameType(np.name),
      })
      gameId = game.id
      gamesCreated += 1
      addToGameIndex(index, np.name, game.id, store)
    } else {
      const matched = matchGameForStore(index, np.name, store)
      if (matched) {
        gameId = matched.id
        matched.occupied.add(store)
      } else {
        const game = await createGame({ name: np.name, productType: parseGameType(np.name) })
        gameId = game.id
        gamesCreated += 1
        addToGameIndex(index, np.name, game.id, store)
      }
    }

    await createListing({
      store,
      gameId,
      naverProductId: np.productId,
      price: np.price,
      discountPricePc: np.discountPricePc,
      discountPriceMobile: np.discountPriceMobile,
      naverSaleStatus: np.naverSaleStatus,
    })
    created += 1
  }

  // 삭제: 이 스토어 리스팅 중 네이버에서 사라진 것(게임은 보존)
  const existingStoreIds = await findNaverProductIdsByStore(store)
  const toDelete = existingStoreIds.filter((id) => !seen.has(id))
  const deleted = await deleteListingsByNaverProductIds(store, toDelete)

  return { created, updated, deleted, gamesCreated }
}

// 단일 스토어 동기화 — 스트림포켓은 레거시 브리지(SteamProduct)도 함께 유지.
export async function syncNaverProducts(store: Store): Promise<StoreSyncResult> {
  const naverProducts = await fetchNaverProducts(store)
  const legacy = store === 'streampocket' ? await syncLegacySteamProducts(naverProducts) : null
  const result = await syncStoreListings(store, naverProducts)
  return { store, ...result, legacy }
}

// 전체 스토어 동기화 — 스토어별 try/catch 격리(한 스토어 실패가 다른 스토어에 영향 없음).
export type StoreSyncOutcome = StoreSyncResult | { store: Store; error: string }

export async function syncAllStores(): Promise<StoreSyncOutcome[]> {
  const results: StoreSyncOutcome[] = []
  for (const store of STORES) {
    try {
      results.push(await syncNaverProducts(store))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await sendDiscordAlert(
        'error',
        `❌ 상품 동기화 실패 [${STORE_LABELS[store]}]\n${message}`,
      ).catch(() => {})
      results.push({ store, error: message })
    }
  }
  return results
}
