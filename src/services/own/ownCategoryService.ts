import {
  findAllOwnCategories,
  findOwnCategoryById,
  createOwnCategory,
  updateOwnCategory,
  deleteOwnCategoryById,
  countOwnProductsByCategoryId,
} from '../../repositories/own/ownCategoryRepository'

export function getOwnCategories() {
  return findAllOwnCategories()
}

export async function createOwnCategoryItem(data: { name: string; sortOrder?: number }) {
  return createOwnCategory(data)
}

export async function updateOwnCategoryItem(id: string, data: { name?: string; sortOrder?: number }) {
  const category = await findOwnCategoryById(id)
  if (!category) {
    throw Object.assign(new Error('카테고리를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return updateOwnCategory(id, data)
}

export async function deleteOwnCategoryItem(id: string) {
  const category = await findOwnCategoryById(id)
  if (!category) {
    throw Object.assign(new Error('카테고리를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  const productCount = await countOwnProductsByCategoryId(id)
  if (productCount > 0) {
    throw Object.assign(
      new Error('해당 카테고리에 상품이 존재하여 삭제할 수 없습니다.'),
      { statusCode: 409 },
    )
  }
  return deleteOwnCategoryById(id)
}
