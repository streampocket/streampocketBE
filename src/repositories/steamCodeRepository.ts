import { prisma } from '../lib/prisma'
import { CodeStatus, SteamCode } from '@prisma/client'

type ListCodesInput = {
  productId?: string
  status?: CodeStatus
  page: number
  pageSize: number
}

type ListCodesResult = {
  items: SteamCode[]
  total: number
}

export async function listCodes(input: ListCodesInput): Promise<ListCodesResult> {
  const where = {
    ...(input.productId ? { productId: input.productId } : {}),
    ...(input.status ? { status: input.status } : {}),
  }
  const [items, total] = await prisma.$transaction([
    prisma.steamCode.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.steamCode.count({ where }),
  ])
  return { items, total }
}

// 사용 가능한 코드 1개를 FIFO(등록 순서)로 선점 (status: available → reserved)
export async function reserveNextAvailableCode(productId: string): Promise<SteamCode | null> {
  // 트랜잭션으로 race condition 방지
  return prisma.$transaction(async (tx) => {
    const code = await tx.steamCode.findFirst({
      where: { productId, status: 'available' },
      orderBy: { createdAt: 'asc' },
    })
    if (!code) return null
    return tx.steamCode.update({
      where: { id: code.id },
      data: { status: 'reserved' },
    })
  })
}

export async function countAvailableCodes(productId: string): Promise<number> {
  return prisma.steamCode.count({ where: { productId, status: 'available' } })
}

export async function bulkCreateCodes(productId: string, codeValues: string[]): Promise<number> {
  const result = await prisma.steamCode.createMany({
    data: codeValues.map((codeValue) => ({ productId, codeValue })),
    skipDuplicates: true,
  })
  return result.count
}

export async function markCodeAsSent(id: string): Promise<SteamCode> {
  return prisma.steamCode.update({ where: { id }, data: { status: 'sent' } })
}

export async function findCodeById(id: string): Promise<SteamCode | null> {
  return prisma.steamCode.findUnique({ where: { id } })
}

export async function disableCode(id: string): Promise<SteamCode> {
  return prisma.steamCode.update({ where: { id }, data: { status: 'disabled' } })
}
