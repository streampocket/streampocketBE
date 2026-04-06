import { prisma } from '../../lib/prisma'

type CreateOwnProductInput = {
  name: string
  categoryId: string
  durationDays: number
  price: number
  totalSlots: number
  imagePath?: string | null
  notes?: string | null
  userId: string
}

type UpdateOwnProductInput = {
  name?: string
  categoryId?: string
  durationDays?: number
  price?: number
  totalSlots?: number
  imagePath?: string | null
  notes?: string | null
  status?: 'recruiting' | 'closed' | 'expired'
}

type OwnProductFilters = {
  categoryId?: string
  status?: 'recruiting' | 'closed' | 'expired'
}

const productInclude = {
  category: true,
  user: { select: { id: true, name: true } },
} as const

export function createOwnProduct(data: CreateOwnProductInput) {
  return prisma.ownProduct.create({
    data,
    include: productInclude,
  })
}

export function findAllOwnProducts(filters: OwnProductFilters) {
  return prisma.ownProduct.findMany({
    where: {
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    },
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  })
}

export function findOwnProductsByUserId(userId: string) {
  return prisma.ownProduct.findMany({
    where: { userId },
    include: productInclude,
    orderBy: { createdAt: 'desc' },
  })
}

export function findOwnProductById(id: string) {
  return prisma.ownProduct.findUnique({
    where: { id },
    include: productInclude,
  })
}

export function updateOwnProduct(id: string, data: UpdateOwnProductInput) {
  return prisma.ownProduct.update({
    where: { id },
    data,
    include: productInclude,
  })
}

export function deleteOwnProductById(id: string) {
  return prisma.ownProduct.delete({ where: { id } })
}
