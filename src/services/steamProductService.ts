import { ProductStatus } from '@prisma/client'
import {
  findAllProducts,
  findProductById,
  findProductByNaverId,
  findAllNaverProductIds,
  createProduct,
  updateProduct,
} from '../repositories/steamProductRepository'
import { fetchNaverProducts } from './platform/naverOrderSource'

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

export async function getProducts(status?: ProductStatus) {
  return findAllProducts(status)
}

export async function getProductDetail(id: string) {
  const product = await findProductById(id)
  if (!product) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return product
}

export async function createSteamProduct(input: CreateProductInput) {
  const existing = await findProductByNaverId(input.naverProductId)
  if (existing) {
    throw Object.assign(new Error('이미 등록된 네이버 상품 ID입니다.'), { statusCode: 409 })
  }
  return createProduct(input)
}

export async function updateSteamProduct(id: string, input: UpdateProductInput) {
  const product = await findProductById(id)
  if (!product) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return updateProduct(id, input)
}

export async function syncNaverProducts(): Promise<{
  created: number
  skipped: number
  products: { naverProductId: string; name: string }[]
}> {
  const [naverProducts, existingIds] = await Promise.all([
    fetchNaverProducts(),
    findAllNaverProductIds(),
  ])

  const existingSet = new Set(existingIds)
  const newProducts = naverProducts.filter((p) => !existingSet.has(p.productId))

  const created = await Promise.all(
    newProducts.map((p) => createProduct({ name: p.name, naverProductId: p.productId })),
  )

  return {
    created: created.length,
    skipped: naverProducts.length - created.length,
    products: created.map((p) => ({ naverProductId: p.naverProductId, name: p.name })),
  }
}
