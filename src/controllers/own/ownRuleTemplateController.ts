import { z } from 'zod'
import type { Request, Response } from 'express'
import {
  getOwnRuleTemplates,
  createOwnRuleTemplateItem,
  updateOwnRuleTemplateItem,
  deleteOwnRuleTemplateItem,
} from '../../services/own/ownRuleTemplateService'

export async function getOwnRuleTemplatesHandler(_req: Request, res: Response): Promise<void> {
  const templates = await getOwnRuleTemplates()
  res.json({ data: templates })
}

const createRuleTemplateSchema = z.object({
  name: z.string().min(1).max(100),
  content: z.string().min(1).max(5000),
})

export async function createOwnRuleTemplateHandler(req: Request, res: Response): Promise<void> {
  const body = createRuleTemplateSchema.parse(req.body)
  const template = await createOwnRuleTemplateItem(body)
  res.status(201).json({ data: template })
}

const updateRuleTemplateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  content: z.string().min(1).max(5000).optional(),
})

const ruleTemplateIdParamSchema = z.object({
  id: z.string().uuid(),
})

export async function updateOwnRuleTemplateHandler(req: Request, res: Response): Promise<void> {
  const { id } = ruleTemplateIdParamSchema.parse(req.params)
  const body = updateRuleTemplateSchema.parse(req.body)
  const template = await updateOwnRuleTemplateItem(id, body)
  res.json({ data: template })
}

export async function deleteOwnRuleTemplateHandler(req: Request, res: Response): Promise<void> {
  const { id } = ruleTemplateIdParamSchema.parse(req.params)
  await deleteOwnRuleTemplateItem(id)
  res.status(204).send()
}
