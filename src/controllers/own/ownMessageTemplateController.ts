import { z } from 'zod'
import type { Request, Response } from 'express'
import {
  getOwnMessageTemplates,
  createOwnMessageTemplateItem,
  updateOwnMessageTemplateItem,
  deleteOwnMessageTemplateItem,
  reorderOwnMessageTemplateItems,
} from '../../services/own/ownMessageTemplateService'

// 본문은 trim하지 않는다 — 안내 문구의 줄바꿈·들여쓰기를 그대로 복사해야 하므로 (빈 문자열만 막음)
const nameSchema = z.string().trim().min(1).max(100)
const contentSchema = z
  .string()
  .max(5000)
  .refine((value) => value.trim().length > 0, '내용을 입력해 주세요.')

const createMessageTemplateSchema = z.object({
  name: nameSchema,
  content: contentSchema,
})

const updateMessageTemplateSchema = z.object({
  name: nameSchema.optional(),
  content: contentSchema.optional(),
})

const reorderMessageTemplatesSchema = z.object({
  ids: z.array(z.string().uuid()).max(1000),
})

const messageTemplateIdParamSchema = z.object({
  id: z.string().uuid(),
})

export async function getOwnMessageTemplatesHandler(_req: Request, res: Response): Promise<void> {
  const templates = await getOwnMessageTemplates()
  res.json({ data: templates })
}

export async function createOwnMessageTemplateHandler(req: Request, res: Response): Promise<void> {
  const body = createMessageTemplateSchema.parse(req.body)
  const template = await createOwnMessageTemplateItem(body)
  res.status(201).json({ data: template })
}

export async function updateOwnMessageTemplateHandler(req: Request, res: Response): Promise<void> {
  const { id } = messageTemplateIdParamSchema.parse(req.params)
  const body = updateMessageTemplateSchema.parse(req.body)
  const template = await updateOwnMessageTemplateItem(id, body)
  res.json({ data: template })
}

export async function deleteOwnMessageTemplateHandler(req: Request, res: Response): Promise<void> {
  const { id } = messageTemplateIdParamSchema.parse(req.params)
  await deleteOwnMessageTemplateItem(id)
  res.status(204).send()
}

export async function reorderOwnMessageTemplatesHandler(req: Request, res: Response): Promise<void> {
  const { ids } = reorderMessageTemplatesSchema.parse(req.body)
  const templates = await reorderOwnMessageTemplateItems(ids)
  res.json({ data: templates })
}
