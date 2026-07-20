import { prisma } from '../lib/prisma'
import { AccountStatus, SteamAccount } from '@prisma/client'

type ListAccountsInput = {
  gameId?: string
  productId?: string
  status?: AccountStatus
  page: number
  pageSize: number
}

// 게임 필터 — 과거 계정(gameId null, productId만 기록) 호환:
// 스트림포켓 게임은 레거시 SteamProduct.id를 게임 id로 재사용하므로(steamProductService.syncStoreListings 참고)
// productId === gameId 인 행도 같은 게임의 재고다. OR 폴백으로 누락 없이 조회한다.
function gameFilter(gameId?: string) {
  return gameId ? { OR: [{ gameId }, { productId: gameId }] } : {}
}

export type AccountWithProductName = Omit<SteamAccount, never> & { productName: string | null }

type ListAccountsResult = {
  items: AccountWithProductName[]
  total: number
}

type ExportAccountsInput = {
  gameId?: string
  productId?: string
  status?: AccountStatus
}

export type AccountExportItem = {
  id: string
  username: string
  password: string
  email: string
  emailPassword: string
  emailSiteUrl: string
  secondaryEmail: string | null
  secondaryEmailPassword: string | null
  secondaryEmailSiteUrl: string | null
  status: AccountStatus
  createdAt: Date
  sentAt: Date | null
  product: { name: string | null }
}

type BulkCreateAccountInput = {
  username: string
  password: string
  email: string
  emailPassword: string
  emailSiteUrl: string
  secondaryEmail?: string
  secondaryEmailPassword?: string
  secondaryEmailSiteUrl?: string
}

type UpdateAccountInput = {
  username: string
  password: string
  email: string
  emailPassword: string
  emailSiteUrl: string
  secondaryEmail?: string | null
  secondaryEmailPassword?: string | null
  secondaryEmailSiteUrl?: string | null
}

export async function listAccounts(input: ListAccountsInput): Promise<ListAccountsResult> {
  const where = {
    ...gameFilter(input.gameId),
    ...(input.productId ? { productId: input.productId } : {}),
    ...(input.status ? { status: input.status } : {}),
  }
  const [rawItems, total] = await prisma.$transaction([
    prisma.steamAccount.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      include: {
        product: { select: { name: true } },
        game: { select: { name: true } },
      },
    }),
    prisma.steamAccount.count({ where }),
  ])
  const items = rawItems.map(({ product, game, ...account }) => ({
    ...account,
    productName: product?.name ?? game?.name ?? account.productNameSnapshot ?? null,
  }))
  return { items, total }
}

export async function exportAccounts(input: ExportAccountsInput): Promise<AccountExportItem[]> {
  const where = {
    ...gameFilter(input.gameId),
    ...(input.productId ? { productId: input.productId } : {}),
    ...(input.status ? { status: input.status } : {}),
  }
  const rows = await prisma.steamAccount.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    include: {
      product: { select: { name: true } },
      game: { select: { name: true } },
      orderItems: {
        where: {
          fulfillmentStatus: { in: ['pending', 'in_progress', 'completed', 'purchase_decided'] },
        },
        select: { updatedAt: true },
        orderBy: { updatedAt: 'desc' },
        take: 1,
      },
    },
  })
  return rows.map((r) => ({
    id: r.id,
    username: r.username,
    password: r.password,
    email: r.email,
    emailPassword: r.emailPassword,
    emailSiteUrl: r.emailSiteUrl,
    secondaryEmail: r.secondaryEmail,
    secondaryEmailPassword: r.secondaryEmailPassword,
    secondaryEmailSiteUrl: r.secondaryEmailSiteUrl,
    status: r.status,
    createdAt: r.createdAt,
    sentAt: r.orderItems[0]?.updatedAt ?? null,
    product: { name: r.product?.name ?? r.game?.name ?? r.productNameSnapshot ?? null },
  }))
}

// 사용 가능한 계정 1개를 FIFO(등록 순서)로 선점 (status: available → reserved)
export async function reserveNextAvailableAccount(productId: string): Promise<SteamAccount | null> {
  return prisma.$transaction(async (tx) => {
    const account = await tx.steamAccount.findFirst({
      where: { productId, status: 'available' },
      orderBy: { createdAt: 'asc' },
    })
    if (!account) return null
    return tx.steamAccount.update({
      where: { id: account.id },
      data: { status: 'reserved' },
    })
  })
}

export async function countAvailableAccounts(productId: string): Promise<number> {
  return prisma.steamAccount.count({ where: { productId, status: 'available' } })
}

// 게임 단위 재고 선점 — NA 재고는 게임(steam_games) 단위로 두 스토어가 공유. FIFO(등록순).
// gameFilter의 OR 폴백으로 과거 계정(gameId null, productId만 기록)도 목록·카운트와 동일하게 소진된다.
export async function reserveNextAvailableAccountByGame(
  gameId: string,
): Promise<SteamAccount | null> {
  return prisma.$transaction(async (tx) => {
    const account = await tx.steamAccount.findFirst({
      where: { ...gameFilter(gameId), status: 'available' },
      orderBy: { createdAt: 'asc' },
    })
    if (!account) return null
    return tx.steamAccount.update({
      where: { id: account.id },
      data: { status: 'reserved' },
    })
  })
}

export async function countAvailableAccountsByGame(gameId: string): Promise<number> {
  return prisma.steamAccount.count({ where: { ...gameFilter(gameId), status: 'available' } })
}

export async function bulkCreateAccounts(
  accounts: BulkCreateAccountInput[],
  meta: { gameId: string; productId: string | null; productNameSnapshot: string },
): Promise<number> {
  const result = await prisma.steamAccount.createMany({
    data: accounts.map(({ username, password, email, emailPassword, emailSiteUrl, secondaryEmail, secondaryEmailPassword, secondaryEmailSiteUrl }) => ({
      productId: meta.productId,
      gameId: meta.gameId,
      productNameSnapshot: meta.productNameSnapshot,
      username,
      password,
      email,
      emailPassword,
      emailSiteUrl,
      secondaryEmail: secondaryEmail || null,
      secondaryEmailPassword: secondaryEmailPassword || null,
      secondaryEmailSiteUrl: secondaryEmailSiteUrl || null,
    })),
  })
  return result.count
}

export async function markAccountAsSent(id: string): Promise<SteamAccount> {
  return prisma.steamAccount.update({ where: { id }, data: { status: 'sent' } })
}

export async function findAccountById(id: string): Promise<SteamAccount | null> {
  return prisma.steamAccount.findUnique({ where: { id } })
}

export async function disableAccount(id: string): Promise<SteamAccount> {
  return prisma.steamAccount.update({ where: { id }, data: { status: 'disabled' } })
}

export async function updateAccount(
  id: string,
  data: UpdateAccountInput,
): Promise<SteamAccount> {
  return prisma.steamAccount.update({
    where: { id },
    data: {
      username: data.username,
      password: data.password,
      email: data.email,
      emailPassword: data.emailPassword,
      emailSiteUrl: data.emailSiteUrl,
      secondaryEmail: data.secondaryEmail === undefined ? undefined : (data.secondaryEmail || null),
      secondaryEmailPassword: data.secondaryEmailPassword === undefined ? undefined : (data.secondaryEmailPassword || null),
      secondaryEmailSiteUrl: data.secondaryEmailSiteUrl === undefined ? undefined : (data.secondaryEmailSiteUrl || null),
    },
  })
}

export async function deleteAccount(id: string): Promise<SteamAccount> {
  return prisma.steamAccount.delete({ where: { id } })
}

// 상품 ID 목록에 속한 available/reserved 계정을 일괄 disabled 처리
export async function bulkDisableByProductIds(productIds: string[]): Promise<number> {
  if (productIds.length === 0) return 0
  const result = await prisma.steamAccount.updateMany({
    where: {
      productId: { in: productIds },
      status: { in: ['available', 'reserved'] },
    },
    data: { status: 'disabled' },
  })
  return result.count
}

// 게임 병합 — 계정 재고를 원 게임에서 대상 게임으로 일괄 이동(NA 재고 공유 보존)
export async function reassignAccountsToGame(
  fromGameId: string,
  toGameId: string,
): Promise<number> {
  const result = await prisma.steamAccount.updateMany({
    where: { gameId: fromGameId },
    data: { gameId: toGameId },
  })
  return result.count
}
