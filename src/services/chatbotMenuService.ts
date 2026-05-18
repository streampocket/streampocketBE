import { z } from 'zod'
import { ChatbotMenuItem } from '@prisma/client'
import {
  createMenuItem,
  deleteMenuItem,
  findActiveMenuItemByLabel,
  findMenuItemById,
  listActiveMenuItems,
  listMenuItems,
  reorderMenuItems,
  updateMenuItem,
} from '../repositories/chatbotMenuRepository'
import { getChatbotWelcomeMessage, setChatbotWelcomeMessage } from './systemSettingsService'

export type ChatbotMenuButton = { label: string; url: string }

export type ChatbotMenuItemDto = {
  id: string
  label: string
  body: string
  imageUrl: string | null
  buttons: ChatbotMenuButton[]
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// DB의 buttons는 Json이므로 안전하게 파싱 (형식 불일치 시 빈 배열)
const buttonsSchema = z.array(z.object({ label: z.string(), url: z.string() }))

function parseButtons(value: unknown): ChatbotMenuButton[] {
  const result = buttonsSchema.safeParse(value)
  return result.success ? result.data : []
}

function toDto(row: ChatbotMenuItem): ChatbotMenuItemDto {
  return {
    id: row.id,
    label: row.label,
    body: row.body,
    imageUrl: row.imageUrl,
    buttons: parseButtons(row.buttons),
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function notFound(): Error {
  return Object.assign(new Error('챗봇 메뉴 항목을 찾을 수 없습니다.'), { statusCode: 404 })
}

// ───────────────────────── 관리자용 ─────────────────────────

export async function getMenuOverview(): Promise<{
  welcomeMessage: string | null
  items: ChatbotMenuItemDto[]
}> {
  const [welcomeMessage, rows] = await Promise.all([getChatbotWelcomeMessage(), listMenuItems()])
  return { welcomeMessage, items: rows.map(toDto) }
}

export async function updateWelcomeMessage(message: string | null): Promise<string | null> {
  return setChatbotWelcomeMessage(message)
}

export async function createMenu(input: {
  label: string
  body: string
  imageUrl: string | null
  buttons: ChatbotMenuButton[]
  isActive: boolean
}): Promise<ChatbotMenuItemDto> {
  // 새 항목은 목록 맨 끝에 배치
  const items = await listMenuItems()
  const created = await createMenuItem({ ...input, sortOrder: items.length })
  return toDto(created)
}

export async function updateMenu(
  id: string,
  input: {
    label?: string
    body?: string
    imageUrl?: string | null
    buttons?: ChatbotMenuButton[]
    isActive?: boolean
  },
): Promise<ChatbotMenuItemDto> {
  const existing = await findMenuItemById(id)
  if (!existing) throw notFound()
  const updated = await updateMenuItem(id, input)
  return toDto(updated)
}

export async function deleteMenu(id: string): Promise<void> {
  const existing = await findMenuItemById(id)
  if (!existing) throw notFound()
  await deleteMenuItem(id)
}

export async function reorderMenus(orderedIds: string[]): Promise<ChatbotMenuItemDto[]> {
  await reorderMenuItems(orderedIds)
  const rows = await listMenuItems()
  return rows.map(toDto)
}

// ───────────────────────── 챗봇 스킬용 ─────────────────────────

// 활성 메뉴 항목 목록 (정렬순)
export async function getActiveMenuItems(): Promise<ChatbotMenuItemDto[]> {
  const rows = await listActiveMenuItems()
  return rows.map(toDto)
}

// 발화가 메뉴 항목 라벨과 정확히 일치하면 그 항목을 반환 (폴백 스킬 매칭용)
export async function resolveMenuItem(utterance: string): Promise<ChatbotMenuItemDto | null> {
  const row = await findActiveMenuItemByLabel(utterance.trim())
  return row ? toDto(row) : null
}

export async function getWelcomeMessage(): Promise<string | null> {
  return getChatbotWelcomeMessage()
}
