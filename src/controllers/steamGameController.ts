import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getGames,
  getGameStoreCounts,
  mergeListingToGame,
  mergeGameInto,
  splitListingToNewGame,
  updateGame,
} from '../services/steamGameService'
import { syncNaverProducts, syncAllStores } from '../services/steamProductService'

const storeEnum = z.enum(['streampocket', 'pokemon_steam'])
const storeProductType = z.enum(['AA', 'NA', 'BG'])

const listGamesQuerySchema = z.object({
  store: storeEnum.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(100),
})

const syncQuerySchema = z.object({
  store: storeEnum.optional(),
})

const mergeSchema = z.object({
  gameId: z.string().uuid(),
})

const mergeGameSchema = z.object({
  targetGameId: z.string().uuid(),
})

const updateGameSchema = z.object({
  name: z.string().min(1).optional(),
  productType: storeProductType.optional(),
})

export async function getGamesHandler(req: Request, res: Response): Promise<void> {
  const { store, search, page, pageSize } = listGamesQuerySchema.parse(req.query)
  const [games, counts] = await Promise.all([
    getGames({ store, search, page, pageSize }),
    getGameStoreCounts(search),
  ])
  res.json({
    data: games.data,
    total: games.total,
    page: games.page,
    pageSize: games.pageSize,
    totalPages: games.totalPages,
    counts,
  })
}

// 스토어별 또는 전체(?store 미지정) 동기화 — 전체는 스토어별 오류 격리.
export async function syncGamesHandler(req: Request, res: Response): Promise<void> {
  const { store } = syncQuerySchema.parse(req.query)
  const result = store ? [await syncNaverProducts(store)] : await syncAllStores()
  res.json({ data: result })
}

export async function mergeListingHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  const { gameId } = mergeSchema.parse(req.body)
  const listing = await mergeListingToGame(id, gameId)
  res.json({ data: listing })
}

// 게임 병합 — 소스 게임(:id)을 대상 게임(body.targetGameId)으로 합침
export async function mergeGameHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  const { targetGameId } = mergeGameSchema.parse(req.body)
  const game = await mergeGameInto(id, targetGameId)
  res.json({ data: game })
}

// 되돌리기(분리) — 리스팅(:id)을 새 게임으로 떼어냄
export async function splitListingHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  const game = await splitListingToNewGame(id)
  res.json({ data: game })
}

export async function updateGameHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  const body = updateGameSchema.parse(req.body)
  const game = await updateGame(id, body)
  res.json({ data: game })
}
