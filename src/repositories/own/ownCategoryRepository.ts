import { prisma } from '../../lib/prisma'

export function findAllOwnCategories() {
  return prisma.ownCategory.findMany({
    orderBy: { sortOrder: 'asc' },
  })
}

export function findOwnCategoryById(id: string) {
  return prisma.ownCategory.findUnique({ where: { id } })
}

export function findOwnCategoryByName(name: string) {
  return prisma.ownCategory.findUnique({ where: { name } })
}

export function createOwnCategory(data: { name: string; sortOrder?: number }) {
  return prisma.ownCategory.create({ data })
}

export function updateOwnCategory(id: string, data: { name?: string; sortOrder?: number }) {
  return prisma.ownCategory.update({ where: { id }, data })
}

export function deleteOwnCategoryById(id: string) {
  return prisma.ownCategory.delete({ where: { id } })
}

export function countOwnProductsByCategoryId(categoryId: string) {
  return prisma.ownProduct.count({ where: { categoryId } })
}
