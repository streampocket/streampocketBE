import { ChatbotMenuItem } from '@prisma/client'
import { prisma } from '../lib/prisma'

type MenuButton = { label: string; url: string }

export type CreateMenuItemInput = {
  label: string
  body: string
  imageUrl: string | null
  buttons: MenuButton[]
  sortOrder: number
  isActive: boolean
}

export type UpdateMenuItemInput = {
  label?: string
  body?: string
  imageUrl?: string | null
  buttons?: MenuButton[]
  sortOrder?: number
  isActive?: boolean
}

export async function listMenuItems(): Promise<ChatbotMenuItem[]> {
  return prisma.chatbotMenuItem.findMany({ orderBy: { sortOrder: 'asc' } })
}

export async function listActiveMenuItems(): Promise<ChatbotMenuItem[]> {
  return prisma.chatbotMenuItem.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })
}

export async function findMenuItemById(id: string): Promise<ChatbotMenuItem | null> {
  return prisma.chatbotMenuItem.findUnique({ where: { id } })
}

// 챗봇 발화 매칭용 — 라벨이 정확히 일치하는 활성 항목
export async function findActiveMenuItemByLabel(label: string): Promise<ChatbotMenuItem | null> {
  return prisma.chatbotMenuItem.findFirst({ where: { label, isActive: true } })
}

export async function createMenuItem(data: CreateMenuItemInput): Promise<ChatbotMenuItem> {
  return prisma.chatbotMenuItem.create({ data })
}

export async function updateMenuItem(
  id: string,
  data: UpdateMenuItemInput,
): Promise<ChatbotMenuItem> {
  return prisma.chatbotMenuItem.update({ where: { id }, data })
}

export async function deleteMenuItem(id: string): Promise<void> {
  await prisma.chatbotMenuItem.delete({ where: { id } })
}

// 전달된 id 순서대로 sortOrder를 0부터 재부여
export async function reorderMenuItems(orderedIds: string[]): Promise<void> {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.chatbotMenuItem.update({ where: { id }, data: { sortOrder: index } }),
    ),
  )
}
