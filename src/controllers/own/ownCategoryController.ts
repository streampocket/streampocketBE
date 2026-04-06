import { z } from 'zod'
import type { Request, Response } from 'express'
import {
  getOwnCategories,
  createOwnCategoryItem,
  updateOwnCategoryItem,
  deleteOwnCategoryItem,
} from '../../services/own/ownCategoryService'

export async function getOwnCategoriesHandler(_req: Request, res: Response): Promise<void> {
  const categories = await getOwnCategories()
  res.json({ data: categories })
}

const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  sortOrder: z.number().int().optional(),
})

export async function createOwnCategoryHandler(req: Request, res: Response): Promise<void> {
  const body = createCategorySchema.parse(req.body)
  const category = await createOwnCategoryItem(body)
  res.status(201).json({ data: category })
}

const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  sortOrder: z.number().int().optional(),
})

const categoryIdParamSchema = z.object({
  id: z.string().uuid(),
})

export async function updateOwnCategoryHandler(req: Request, res: Response): Promise<void> {
  const { id } = categoryIdParamSchema.parse(req.params)
  const body = updateCategorySchema.parse(req.body)
  const category = await updateOwnCategoryItem(id, body)
  res.json({ data: category })
}

export async function deleteOwnCategoryHandler(req: Request, res: Response): Promise<void> {
  const { id } = categoryIdParamSchema.parse(req.params)
  await deleteOwnCategoryItem(id)
  res.status(204).send()
}
