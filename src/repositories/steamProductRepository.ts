import { prisma } from '../lib/prisma'
import { ProductStatus, SteamProduct } from '@prisma/client'

type CreateProductInput = {
  name: string
  naverProductId: string
}

type UpdateProductInput = {
  name?: string
  status?: ProductStatus
}

type ProductWithAccountCount = SteamProduct & {
  _count: { accounts: number }
}

export async function findAllProducts(status?: ProductStatus): Promise<ProductWithAccountCount[]> {
  return prisma.steamProduct.findMany({
    where: status ? { status } : undefined,
    include: { _count: { select: { accounts: { where: { status: 'available' } } } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findProductById(id: string): Promise<ProductWithAccountCount | null> {
  return prisma.steamProduct.findUnique({
    where: { id },
    include: { _count: { select: { accounts: { where: { status: 'available' } } } } },
  })
}

export async function findProductByNaverId(naverProductId: string): Promise<SteamProduct | null> {
  return prisma.steamProduct.findUnique({ where: { naverProductId } })
}

export async function createProduct(data: CreateProductInput): Promise<SteamProduct> {
  return prisma.steamProduct.create({ data })
}

export async function updateProduct(id: string, data: UpdateProductInput): Promise<SteamProduct> {
  return prisma.steamProduct.update({ where: { id }, data })
}

export async function findAllNaverProductIds(): Promise<string[]> {
  const products = await prisma.steamProduct.findMany({ select: { naverProductId: true } })
  return products.map((p) => p.naverProductId)
}

// naverProductId 목록으로 실제 productId 목록 반환
export async function findProductIdsByNaverIds(naverProductIds: string[]): Promise<string[]> {
  if (naverProductIds.length === 0) return []
  const products = await prisma.steamProduct.findMany({
    where: { naverProductId: { in: naverProductIds } },
    select: { id: true },
  })
  return products.map((p) => p.id)
}

// inactive가 아닌 상품(active/draft)의 naverProductId 목록 반환
export async function findActiveNaverProductIds(): Promise<string[]> {
  const products = await prisma.steamProduct.findMany({
    where: { status: { not: 'inactive' } },
    select: { naverProductId: true },
  })
  return products.map((p) => p.naverProductId)
}

// naverProductId 목록에 해당하는 상품을 일괄 inactive 처리
export async function bulkInactivateByNaverIds(naverProductIds: string[]): Promise<number> {
  if (naverProductIds.length === 0) return 0
  const result = await prisma.steamProduct.updateMany({
    where: { naverProductId: { in: naverProductIds } },
    data: { status: 'inactive' },
  })
  return result.count
}
