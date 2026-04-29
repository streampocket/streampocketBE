import { prisma } from '../lib/prisma'
import { ProductStatus, SteamProduct } from '@prisma/client'

type CreateProductInput = {
  name: string
  naverProductId: string
  price?: number | null
  discountPricePc?: number | null
  discountPriceMobile?: number | null
}

type UpdateProductInput = {
  name?: string
  status?: ProductStatus
}

type ProductWithAccountCount = SteamProduct & {
  _count: { accounts: number }
}

type FindAllProductsParams = {
  status?: ProductStatus
  search?: string
  page: number
  pageSize: number
}

export async function findAllProducts(
  params: FindAllProductsParams,
): Promise<{ data: ProductWithAccountCount[]; total: number }> {
  const { status, search, page, pageSize } = params
  const where = {
    ...(status ? { status } : {}),
    ...(search ? { name: { contains: search, mode: 'insensitive' as const } } : {}),
  }

  const [data, total] = await Promise.all([
    prisma.steamProduct.findMany({
      where,
      include: { _count: { select: { accounts: { where: { status: 'available' } } } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.steamProduct.count({ where }),
  ])

  return { data, total }
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

export async function findProductFieldsByNaverIds(
  naverProductIds: string[],
): Promise<{
  naverProductId: string
  name: string
  price: number | null
  discountPricePc: number | null
  discountPriceMobile: number | null
}[]> {
  if (naverProductIds.length === 0) return []
  return prisma.steamProduct.findMany({
    where: { naverProductId: { in: naverProductIds } },
    select: {
      naverProductId: true,
      name: true,
      price: true,
      discountPricePc: true,
      discountPriceMobile: true,
    },
  })
}

export async function updateProductByNaverId(
  naverProductId: string,
  data: {
    name?: string
    price?: number | null
    discountPricePc?: number | null
    discountPriceMobile?: number | null
  },
): Promise<void> {
  await prisma.steamProduct.update({ where: { naverProductId }, data })
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

export async function countProductsByStatus(search?: string): Promise<{
  total: number
  active: number
  draft: number
  inactive: number
}> {
  const nameFilter = search ? { name: { contains: search, mode: 'insensitive' as const } } : {}
  const [total, active, draft, inactive] = await Promise.all([
    prisma.steamProduct.count({ where: { ...nameFilter } }),
    prisma.steamProduct.count({ where: { status: 'active', ...nameFilter } }),
    prisma.steamProduct.count({ where: { status: 'draft', ...nameFilter } }),
    prisma.steamProduct.count({ where: { status: 'inactive', ...nameFilter } }),
  ])
  return { total, active, draft, inactive }
}

export async function deleteProductById(id: string): Promise<void> {
  await prisma.steamProduct.delete({ where: { id } })
}

// naverProductId 목록에 해당하는 상품 삭제
export async function bulkDeleteProductsByNaverIds(naverProductIds: string[]): Promise<number> {
  if (naverProductIds.length === 0) return 0
  const result = await prisma.steamProduct.deleteMany({
    where: { naverProductId: { in: naverProductIds } },
  })
  return result.count
}
