import { ProductStatus } from '@prisma/client'
import {
  findAllProducts,
  findProductById,
  findProductByNaverId,
  findAllNaverProductIds,
  findActiveNaverProductIds,
  bulkDeleteProductsByNaverIds,
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
  deleted: number
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

  // 삭제 처리: active/draft 상품 중 네이버에 없는 것
  const naverSet = new Set(naverProducts.map((p) => p.productId))
  const toDelete = activeIds.filter((id) => !naverSet.has(id))

  let deleted = 0
  if (toDelete.length > 0) {
    // onDelete: SetNull 이므로 상품 삭제 시 연결 계정의 productId가 자동으로 null 처리됨
    deleted = await bulkDeleteProductsByNaverIds(toDelete)
  }

  return {
    created: created.length,
    skipped: naverProducts.length - created.length,
    deleted,
    products: created.map((p) => ({ naverProductId: p.naverProductId, name: p.name })),
  }
}
