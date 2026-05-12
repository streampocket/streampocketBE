import type { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'

const POST_INCLUDE = {
  authorUser: { select: { id: true, name: true } },
  authorAdmin: { select: { id: true } },
} as const

type ListInput = {
  page: number
  pageSize: number
  category?: 'notice' | 'free'
}

export async function findPostsForPublic(input: ListInput) {
  const where: Prisma.CommunityPostWhereInput = {
    deletedAt: null,
    ...(input.category ? { category: input.category } : {}),
  }

  const [items, total] = await Promise.all([
    prisma.communityPost.findMany({
      where,
      include: POST_INCLUDE,
      orderBy: { createdAt: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
    }),
    prisma.communityPost.count({ where }),
  ])

  return { items, total }
}

export function findPinnedNotices(limit: number) {
  return prisma.communityPost.findMany({
    where: { deletedAt: null, category: 'notice' },
    include: POST_INCLUDE,
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export function findPostById(id: string) {
  return prisma.communityPost.findFirst({
    where: { id, deletedAt: null },
    include: POST_INCLUDE,
  })
}

export function findPostByIdRaw(id: string) {
  return prisma.communityPost.findUnique({ where: { id } })
}

export function findAllPostIdsForSitemap() {
  return prisma.communityPost.findMany({
    where: { deletedAt: null },
    select: { id: true, updatedAt: true },
    orderBy: { createdAt: 'desc' },
  })
}

type CreatePostInput = {
  category: 'notice' | 'free'
  title: string
  content: string
  imageUrl: string | null
  authorUserId: string | null
  authorAdminId: string | null
}

export function createPost(data: CreatePostInput) {
  return prisma.communityPost.create({ data, include: POST_INCLUDE })
}

type UpdatePostInput = {
  title?: string
  content?: string
  imageUrl?: string | null
  category?: 'notice' | 'free'
}

export function updatePost(id: string, data: UpdatePostInput) {
  return prisma.communityPost.update({
    where: { id },
    data,
    include: POST_INCLUDE,
  })
}

export function softDeletePost(id: string) {
  return prisma.communityPost.update({
    where: { id },
    data: { deletedAt: new Date() },
  })
}
