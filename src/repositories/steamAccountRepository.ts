import { prisma } from '../lib/prisma'
import { AccountStatus, SteamAccount } from '@prisma/client'

type ListAccountsInput = {
  productId?: string
  status?: AccountStatus
  page: number
  pageSize: number
}

type ListAccountsResult = {
  items: SteamAccount[]
  total: number
}

type BulkCreateAccountInput = {
  username: string
  password: string
}

export async function listAccounts(input: ListAccountsInput): Promise<ListAccountsResult> {
  const where = {
    ...(input.productId ? { productId: input.productId } : {}),
    ...(input.status ? { status: input.status } : {}),
  }
  const [items, total] = await prisma.$transaction([
    prisma.steamAccount.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.steamAccount.count({ where }),
  ])
  return { items, total }
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

export async function bulkCreateAccounts(
  productId: string,
  accounts: BulkCreateAccountInput[],
): Promise<number> {
  const result = await prisma.steamAccount.createMany({
    data: accounts.map(({ username, password }) => ({ productId, username, password })),
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
