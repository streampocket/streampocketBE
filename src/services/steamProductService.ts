import { ProductStatus } from '@prisma/client'
import {
  findAllProducts,
  findProductById,
  findProductByNaverId,
  findAllNaverProductIds,
  findActiveNaverProductIds,
  findProductIdsByNaverIds,
  bulkInactivateByNaverIds,
  createProduct,
  updateProduct,
} from '../repositories/steamProductRepository'
import { bulkDisableByProductIds } from '../repositories/steamAccountRepository'
import { fetchNaverProducts } from './platform/naverOrderSource'

type CreateProductInput = {
  name: string
  naverProductId: string
}

type UpdateProductInput = {
  name?: string
  status?: ProductStatus
}

export async function getProducts(status?: ProductStatus) {
  const products = await findAllProducts(status)
  return products.map(({ _count, ...rest }) => ({ ...rest, stockCount: _count.accounts }))
}

export async function getProductDetail(id: string) {
  const product = await findProductById(id)
  if (!product) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  const { _count, ...rest } = product
  return { ...rest, stockCount: _count.accounts }
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
  // 상품 inactive 처리 시 연결된 available/reserved 계정도 disabled
  if (input.status === 'inactive') {
    await bulkDisableByProductIds([id])
  }
  return updateProduct(id, input)
}

export async function syncNaverProducts(): Promise<{
  created: number
  skipped: number
  deactivated: number
  products: { naverProductId: string; name: string }[]
}> {
  const [naverProducts, existingIds, activeIds] = await Promise.all([
    fetchNaverProducts(),
    findAllNaverProductIds(),
    findActiveNaverProductIds(),
  ])

  // 신규 추가: 전체 DB에 없는 상품 생성
  const existingSet = new Set(existingIds)
  const newProducts = naverProducts.filter((p) => !existingSet.has(p.productId))
  const created = await Promise.all(
    newProducts.map((p) => createProduct({ name: p.name, naverProductId: p.productId })),
  )

  // inactive 처리: active/draft 상품 중 네이버에 없는 것
  const naverSet = new Set(naverProducts.map((p) => p.productId))
  const toDeactivate = activeIds.filter((id) => !naverSet.has(id))

  // 비활성화될 상품의 연결 계정도 disabled 처리
  if (toDeactivate.length > 0) {
    const productIds = await findProductIdsByNaverIds(toDeactivate)
    await bulkDisableByProductIds(productIds)
  }

  const deactivated = await bulkInactivateByNaverIds(toDeactivate)

  return {
    created: created.length,
    skipped: naverProducts.length - created.length,
    deactivated,
    products: created.map((p) => ({ naverProductId: p.naverProductId, name: p.name })),
  }
}
