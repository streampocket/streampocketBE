import { SteamGame, SteamProductType, Store, StoreListing } from '@prisma/client'
import { prisma } from '../lib/prisma'

export type GameForMatching = {
  id: string
  name: string
  productType: SteamProductType
  listings: { store: Store }[]
}

export type GameWithListingsAndStock = SteamGame & {
  listings: StoreListing[]
  _count: { accounts: number }
}

type ListGamesParams = {
  store?: Store
  search?: string
  page: number
  pageSize: number
}

export type GameOption = {
  id: string
  name: string
  productType: SteamProductType
}

// 드롭다운용 경량 목록 — 비페이징 (계정관리 등록/필터 등)
export async function listGameOptions(
  productTypes?: SteamProductType[],
): Promise<GameOption[]> {
  return prisma.steamGame.findMany({
    where: productTypes ? { productType: { in: productTypes } } : {},
    select: { id: true, name: true, productType: true },
    orderBy: { name: 'asc' },
  })
}

// 게임 매칭/스토어 점유 확인용 — 정규화 매칭은 서비스에서 in-memory 로 수행
export async function findGamesForMatching(): Promise<GameForMatching[]> {
  return prisma.steamGame.findMany({
    select: {
      id: true,
      name: true,
      productType: true,
      listings: { select: { store: true } },
    },
  })
}

export async function createGame(data: {
  id?: string
  name: string
  productType: SteamProductType
}): Promise<SteamGame> {
  return prisma.steamGame.create({ data })
}

export async function findGameById(id: string): Promise<SteamGame | null> {
  return prisma.steamGame.findUnique({ where: { id } })
}

export async function updateGame(
  id: string,
  data: { name?: string; productType?: SteamProductType },
): Promise<SteamGame> {
  return prisma.steamGame.update({ where: { id }, data })
}

// 병합 후 비워진 게임 삭제. (리스팅/계정/주문은 호출 전에 대상 게임으로 이동되어 있어야 함)
export async function deleteGame(id: string): Promise<void> {
  await prisma.steamGame.delete({ where: { id } })
}

// 상품관리 페이지 — 게임 + 스토어별 리스팅 + 가용 재고(game_id 기준) 카운트
export async function listGamesWithListingsAndStock(
  params: ListGamesParams,
): Promise<{ data: GameWithListingsAndStock[]; total: number }> {
  const where = {
    ...(params.search ? { name: { contains: params.search, mode: 'insensitive' as const } } : {}),
    ...(params.store ? { listings: { some: { store: params.store } } } : {}),
  }

  const [data, total] = await Promise.all([
    prisma.steamGame.findMany({
      where,
      include: {
        listings: { orderBy: { store: 'asc' } },
        _count: { select: { accounts: { where: { status: 'available' } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize,
    }),
    prisma.steamGame.count({ where }),
  ])

  return { data, total }
}

// 스토어 필터 탭 카운트 — 전체 / 각 스토어에 리스팅이 있는 게임 수
export async function countGamesByStore(search?: string): Promise<{
  total: number
  streampocket: number
  pokemon_steam: number
}> {
  const nameFilter = search
    ? { name: { contains: search, mode: 'insensitive' as const } }
    : {}
  const [total, streampocket, pokemonSteam] = await Promise.all([
    prisma.steamGame.count({ where: nameFilter }),
    prisma.steamGame.count({
      where: { ...nameFilter, listings: { some: { store: 'streampocket' } } },
    }),
    prisma.steamGame.count({
      where: { ...nameFilter, listings: { some: { store: 'pokemon_steam' } } },
    }),
  ])
  return { total, streampocket, pokemon_steam: pokemonSteam }
}
