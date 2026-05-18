import { Request, Response } from 'express'
import { z } from 'zod'
import {
  createMenu,
  deleteMenu,
  getMenuOverview,
  reorderMenus,
  updateMenu,
  updateWelcomeMessage,
} from '../services/chatbotMenuService'
import { generateChatbotMenuImagePresignedUrl } from '../lib/s3'

// 카카오 카드 버튼은 최대 3개
const buttonSchema = z.object({
  label: z.string().trim().min(1, '버튼 이름을 입력해주세요.').max(20),
  url: z.string().trim().url('올바른 링크 주소를 입력해주세요.'),
})

const createMenuSchema = z.object({
  label: z.string().trim().min(1, '메뉴 이름을 입력해주세요.').max(100),
  body: z.string().trim().min(1, '응답 본문을 입력해주세요.'),
  imageUrl: z.string().trim().url().nullable().default(null),
  buttons: z.array(buttonSchema).max(3, '버튼은 최대 3개까지 가능합니다.').default([]),
  isActive: z.boolean().default(true),
})

const updateMenuSchema = z.object({
  label: z.string().trim().min(1).max(100).optional(),
  body: z.string().trim().min(1).optional(),
  imageUrl: z.string().trim().url().nullable().optional(),
  buttons: z.array(buttonSchema).max(3, '버튼은 최대 3개까지 가능합니다.').optional(),
  isActive: z.boolean().optional(),
})

const updateWelcomeSchema = z.object({
  welcomeMessage: z.string().trim().max(1000).nullable().default(null),
})

const reorderSchema = z.object({
  orderedIds: z.array(z.string().uuid()),
})

const imageUploadSchema = z.object({
  contentType: z.string().min(1),
  contentLength: z.number().int().positive(),
})

export async function getMenusHandler(_req: Request, res: Response): Promise<void> {
  const data = await getMenuOverview()
  res.json({ data })
}

export async function updateWelcomeHandler(req: Request, res: Response): Promise<void> {
  const { welcomeMessage } = updateWelcomeSchema.parse(req.body)
  const updated = await updateWelcomeMessage(welcomeMessage)
  res.json({ data: { welcomeMessage: updated } })
}

export async function createMenuHandler(req: Request, res: Response): Promise<void> {
  const body = createMenuSchema.parse(req.body)
  const created = await createMenu(body)
  res.status(201).json({ data: created })
}

export async function updateMenuHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const body = updateMenuSchema.parse(req.body)
  const updated = await updateMenu(req.params.id, body)
  res.json({ data: updated })
}

export async function deleteMenuHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  await deleteMenu(req.params.id)
  res.json({ data: { id: req.params.id } })
}

export async function reorderMenusHandler(req: Request, res: Response): Promise<void> {
  const { orderedIds } = reorderSchema.parse(req.body)
  const items = await reorderMenus(orderedIds)
  res.json({ data: items })
}

export async function issueMenuImageUploadUrlHandler(req: Request, res: Response): Promise<void> {
  const { contentType, contentLength } = imageUploadSchema.parse(req.body)
  const result = await generateChatbotMenuImagePresignedUrl({ contentType, contentLength })
  res.json({ data: result })
}
