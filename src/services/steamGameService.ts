import { SteamProductType, Store } from '@prisma/client'
import {
  listGamesWithListingsAndStock,
  countGamesByStore,
  findGameById,
  createGame,
  deleteGame,
  updateGame as updateGameRepo,
} from '../repositories/steamGameRepository'
import {
  findListingById,
  findListingsByGameId,
  findListingByStoreAndGame,
  updateListingGameId,
} from '../repositories/storeListingRepository'
import { reassignAccountsToGame } from '../repositories/steamAccountRepository'
import { reassignOrderItemsToGame } from '../repositories/steamOrderRepository'

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

// 게임 병합 — 소스 게임을 대상 게임으로 합친다. 소스의 리스팅·계정·주문을 대상으로 옮기고
// 빈 소스 게임을 삭제 → 같은 게임이 두 스토어로 나뉘었던 것을 하나로(특히 NA 재고 공유).
export async function mergeGameInto(sourceGameId: string, targetGameId: string) {
  if (sourceGameId === targetGameId) {
    throw Object.assign(new Error('같은 게임끼리는 병합할 수 없습니다.'), { statusCode: 400 })
  }
  const source = await findGameById(sourceGameId)
  if (!source) {
    throw Object.assign(new Error('병합할 게임을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  const target = await findGameById(targetGameId)
  if (!target) {
    throw Object.assign(new Error('대상 게임을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (source.productType !== target.productType) {
    throw Object.assign(
      new Error('상품 타입이 다른 게임끼리는 병합할 수 없습니다.'),
      { statusCode: 400 },
    )
  }

  const sourceListings = await findListingsByGameId(sourceGameId)
  // 스토어 충돌 검사 — 대상이 이미 소스의 스토어 리스팅을 가지면 병합 불가
  for (const listing of sourceListings) {
    const conflict = await findListingByStoreAndGame(listing.store, targetGameId)
    if (conflict) {
      throw Object.assign(
        new Error('대상 게임에 이미 해당 스토어의 리스팅이 있어 병합할 수 없습니다.'),
        { statusCode: 409 },
      )
    }
  }

  // 리스팅·계정·주문을 대상 게임으로 이동 후 빈 소스 게임 삭제
  for (const listing of sourceListings) {
    await updateListingGameId(listing.id, targetGameId)
  }
  await reassignAccountsToGame(sourceGameId, targetGameId)
  await reassignOrderItemsToGame(sourceGameId, targetGameId)
  await deleteGame(sourceGameId)

  return target
}

// 되돌리기(분리) — 리스팅을 새 게임으로 떼어낸다(병합 취소). 계정은 원 게임 풀에 남김(재고 비공유).
// 새 게임 이름은 원 게임명 복사 — 필요 시 게임수정으로 정정.
export async function splitListingToNewGame(listingId: string) {
  const listing = await findListingById(listingId)
  if (!listing) {
    throw Object.assign(new Error('리스팅을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  const game = await findGameById(listing.gameId)
  if (!game) {
    throw Object.assign(new Error('원 게임을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  const newGame = await createGame({ name: game.name, productType: game.productType })
  await updateListingGameId(listingId, newGame.id)
  return newGame
}
