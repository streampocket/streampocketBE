import { prisma } from '../lib/prisma'
import { ProductStatus, SteamProduct } from '@prisma/client'

type CreateProductInput = {
  name: string
  naverProductId: string
  description?: string
  caution?: string
  event?: string
}

type UpdateProductInput = {
  name?: string
  description?: string
  caution?: string
  event?: string
  status?: ProductStatus
}

type ProductWithCodeCount = SteamProduct & {
  _count: { codes: number }
}

export async function findAllProducts(status?: ProductStatus): Promise<ProductWithCodeCount[]> {
  return prisma.steamProduct.findMany({
    where: status ? { status } : undefined,
    include: { _count: { select: { codes: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export async function findProductById(id: string): Promise<ProductWithCodeCount | null> {
  return prisma.steamProduct.findUnique({
    where: { id },
    include: { _count: { select: { codes: true } } },
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
