import { prisma } from '../lib/prisma'
import { AccountStatus, SteamAccount } from '@prisma/client'

type ListAccountsInput = {
  productId?: string
  status?: AccountStatus
  page: number
  pageSize: number
}

export type AccountWithProductName = Omit<SteamAccount, never> & { productName: string }

type ListAccountsResult = {
  items: AccountWithProductName[]
  total: number
}

type ExportAccountsInput = {
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
  status: AccountStatus
  createdAt: Date
  sentAt: Date | null
  product: { name: string }
}

type BulkCreateAccountInput = {
  username: string
  password: string
  email: string
  emailPassword: string
  emailSiteUrl: string
}

export async function listAccounts(input: ListAccountsInput): Promise<ListAccountsResult> {
  const where = {
    ...(input.productId ? { productId: input.productId } : {}),
    ...(input.status ? { status: input.status } : {}),
  }
  const [rawItems, total] = await prisma.$transaction([
    prisma.steamAccount.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      include: { product: { select: { name: true } } },
    }),
    prisma.steamAccount.count({ where }),
  ])
  const items = rawItems.map(({ product, ...account }) => ({
    ...account,
    productName: product.name,
  }))
  return { items, total }
}

export async function exportAccounts(input: ExportAccountsInput): Promise<AccountExportItem[]> {
  const where = {
    ...(input.productId ? { productId: input.productId } : {}),
    ...(input.status ? { status: input.status } : {}),
  }
  const rows = await prisma.steamAccount.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    include: {
      product: { select: { name: true } },
      orderItems: {
        where: { fulfillmentStatus: 'completed' },
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
    status: r.status,
    createdAt: r.createdAt,
    sentAt: r.orderItems[0]?.updatedAt ?? null,
    product: { name: r.product.name },
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

export async function bulkCreateAccounts(
  productId: string,
  accounts: BulkCreateAccountInput[],
): Promise<number> {
  const result = await prisma.steamAccount.createMany({
    data: accounts.map(({ username, password, email, emailPassword, emailSiteUrl }) => ({
      productId,
      username,
      password,
      email,
      emailPassword,
      emailSiteUrl,
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
