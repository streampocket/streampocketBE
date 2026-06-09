import { SteamGame, Store, StoreListing } from '@prisma/client'
import { prisma } from '../lib/prisma'

type ListingFields = {
  price: number | null
  discountPricePc: number | null
  discountPriceMobile: number | null
  // 네이버 실제 판매상태(statusType). 동기화 시 매번 최신값으로 갱신.
  naverSaleStatus: string | null
}

type CreateListingInput = ListingFields & {
  store: Store
  gameId: string
  naverProductId: string
}

export async function findListingByNaverProductId(
  naverProductId: string,
): Promise<StoreListing | null> {
  return prisma.storeListing.findUnique({ where: { naverProductId } })
}

// 주문 해석용 — naverProductId 로 리스팅 + 게임(타입)을 한 번에 조회 (store/gameId/productType)
export async function findListingWithGameByNaverProductId(
  naverProductId: string,
): Promise<(StoreListing & { game: SteamGame }) | null> {
  return prisma.storeListing.findUnique({
    where: { naverProductId },
    include: { game: true },
  })
}

export async function createListing(data: CreateListingInput): Promise<StoreListing> {
  return prisma.storeListing.create({ data })
}

// 동기화 시 가격/할인가/네이버 판매상태 갱신. (구 ProductStatus status는 건드리지 않음)
export async function updateListingFields(
  id: string,
  data: ListingFields,
): Promise<void> {
  await prisma.storeListing.update({ where: { id }, data })
}

// 수동 병합 — 리스팅을 다른 게임으로 재연결
export async function updateListingGameId(id: string, gameId: string): Promise<StoreListing> {
  return prisma.storeListing.update({ where: { id }, data: { gameId } })
}

export async function findNaverProductIdsByStore(store: Store): Promise<string[]> {
  const rows = await prisma.storeListing.findMany({
    where: { store },
    select: { naverProductId: true },
  })
  return rows.map((r) => r.naverProductId)
}

export async function deleteListingsByNaverProductIds(
  store: Store,
  naverProductIds: string[],
): Promise<number> {
  if (naverProductIds.length === 0) return 0
  const result = await prisma.storeListing.deleteMany({
    where: { store, naverProductId: { in: naverProductIds } },
  })
  return result.count
}

export async function findListingById(id: string): Promise<StoreListing | null> {
  return prisma.storeListing.findUnique({ where: { id } })
}

export async function findListingsByGameId(gameId: string): Promise<StoreListing[]> {
  return prisma.storeListing.findMany({ where: { gameId } })
}

export async function findListingByStoreAndGame(
  store: Store,
  gameId: string,
): Promise<StoreListing | null> {
  return prisma.storeListing.findUnique({ where: { store_gameId: { store, gameId } } })
}

// 레거시 SteamProduct id → 게임 id (스트림포켓 리스팅 경유). 계정 생성 시 game_id 기록용.
export async function findGameIdByProductId(productId: string): Promise<string | null> {
  const product = await prisma.steamProduct.findUnique({
    where: { id: productId },
    select: { naverProductId: true },
  })
  if (!product) return null
  const listing = await prisma.storeListing.findUnique({
    where: { naverProductId: product.naverProductId },
    select: { gameId: true },
  })
  return listing?.gameId ?? null
}
