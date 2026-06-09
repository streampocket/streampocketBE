import { SteamProductType, Store } from '@prisma/client'
import {
  listGamesWithListingsAndStock,
  countGamesByStore,
  findGameById,
  updateGame as updateGameRepo,
} from '../repositories/steamGameRepository'
import {
  findListingById,
  findListingByStoreAndGame,
  updateListingGameId,
} from '../repositories/storeListingRepository'

type GetGamesInput = {
  store?: Store
  search?: string
  page: number
  pageSize: number
}

// 상품관리 페이지 — 게임 + 스토어별 리스팅 + 가용 재고 수
export async function getGames(input: GetGamesInput) {
  const { data, total } = await listGamesWithListingsAndStock(input)
  const items = data.map(({ _count, ...game }) => ({
    ...game,
    stockCount: _count.accounts,
  }))
  const totalPages = total === 0 ? 1 : Math.ceil(total / input.pageSize)
  return {
    data: items,
    total,
    page: input.page,
    pageSize: input.pageSize,
    totalPages,
  }
}

export async function getGameStoreCounts(search?: string) {
  return countGamesByStore(search)
}

// 게임 이름/타입 수정 — 백필 오파싱 타입 교정 등
export async function updateGame(
  id: string,
  data: { name?: string; productType?: SteamProductType },
) {
  const game = await findGameById(id)
  if (!game) {
    throw Object.assign(new Error('게임을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return updateGameRepo(id, data)
}

// 수동 병합 — 리스팅을 다른 게임으로 재연결. 같은 스토어 중복 리스팅은 차단.
export async function mergeListingToGame(listingId: string, gameId: string) {
  const listing = await findListingById(listingId)
  if (!listing) {
    throw Object.assign(new Error('리스팅을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  const game = await findGameById(gameId)
  if (!game) {
    throw Object.assign(new Error('대상 게임을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  const conflict = await findListingByStoreAndGame(listing.store, gameId)
  if (conflict && conflict.id !== listingId) {
    throw Object.assign(
      new Error('대상 게임에 이미 해당 스토어의 리스팅이 있습니다.'),
      { statusCode: 409 },
    )
  }

  return updateListingGameId(listingId, gameId)
}
