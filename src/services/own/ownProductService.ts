import {
  findOwnCategoryByName,
  createOwnCategory,
} from '../../repositories/own/ownCategoryRepository'
import { findPartnerByUserId } from '../../repositories/own/partnerRepository'
import {
  createOwnProduct,
  findAllOwnProducts,
  findOwnProductsByUserId,
  findOwnProductById,
  updateOwnProduct,
  deleteOwnProductById,
} from '../../repositories/own/ownProductRepository'

type CreateInput = {
  name: string
  durationDays: number
  price: number
  totalSlots: number
  imagePath?: string | null
  notes?: string | null
  userId: string
}

type UpdateInput = {
  name?: string
  durationDays?: number
  price?: number
  totalSlots?: number
  imagePath?: string | null
  notes?: string | null
}

async function resolveCategoryByName(name: string): Promise<string> {
  const existing = await findOwnCategoryByName(name)
  if (existing) return existing.id
  const created = await createOwnCategory({ name })
  return created.id
}

type ListFilters = {
  categoryId?: string
  status?: 'recruiting' | 'closed' | 'expired'
}

export async function createOwnProductItem(input: CreateInput) {
  const partner = await findPartnerByUserId(input.userId)
  if (!partner || partner.status !== 'approved') {
    throw Object.assign(new Error('파트너 승인이 필요합니다.'), { statusCode: 403 })
  }
  const categoryId = await resolveCategoryByName(input.name)
  return createOwnProduct({ ...input, categoryId })
}

export function getOwnProducts(filters: ListFilters) {
  return findAllOwnProducts(filters)
}

export function getMyOwnProducts(userId: string) {
  return findOwnProductsByUserId(userId)
}

export async function getOwnProductDetail(id: string) {
  const product = await findOwnProductById(id)
  if (!product) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return product
}

export async function updateOwnProductItem(id: string, userId: string, data: UpdateInput) {
  const product = await findOwnProductById(id)
  if (!product) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (product.userId !== userId) {
    throw Object.assign(new Error('본인의 상품만 수정할 수 있습니다.'), { statusCode: 403 })
  }
  if (data.totalSlots !== undefined && data.totalSlots < product.filledSlots) {
    throw Object.assign(
      new Error('모집 총인원은 현재 모집된 인원보다 작을 수 없습니다.'),
      { statusCode: 400 },
    )
  }
  const updateData: Record<string, unknown> = { ...data }
  if (data.name) {
    updateData.categoryId = await resolveCategoryByName(data.name)
  }
  return updateOwnProduct(id, updateData)
}

export async function closeOwnProduct(id: string, userId: string) {
  const product = await findOwnProductById(id)
  if (!product) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (product.userId !== userId) {
    throw Object.assign(new Error('본인의 상품만 닫을 수 있습니다.'), { statusCode: 403 })
  }
  if (product.status !== 'recruiting') {
    throw Object.assign(new Error('모집중인 상품만 닫을 수 있습니다.'), { statusCode: 400 })
  }
  return updateOwnProduct(id, { status: 'closed' })
}

export async function deleteOwnProductItem(id: string, userId: string) {
  const product = await findOwnProductById(id)
  if (!product) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (product.userId !== userId) {
    throw Object.assign(new Error('본인의 상품만 삭제할 수 있습니다.'), { statusCode: 403 })
  }
  if (product.status !== 'recruiting') {
    throw Object.assign(new Error('모집중인 상품만 삭제할 수 있습니다.'), { statusCode: 400 })
  }
  return deleteOwnProductById(id)
}

// 관리자용 (소유권 검증 없음)
export async function adminUpdateOwnProduct(id: string, data: UpdateInput) {
  const product = await findOwnProductById(id)
  if (!product) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (data.totalSlots !== undefined && data.totalSlots < product.filledSlots) {
    throw Object.assign(
      new Error('모집 총인원은 현재 모집된 인원보다 작을 수 없습니다.'),
      { statusCode: 400 },
    )
  }
  const updateData: Record<string, unknown> = { ...data }
  if (data.name) {
    updateData.categoryId = await resolveCategoryByName(data.name)
  }
  return updateOwnProduct(id, updateData)
}

export async function adminDeleteOwnProduct(id: string) {
  const product = await findOwnProductById(id)
  if (!product) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return deleteOwnProductById(id)
}
