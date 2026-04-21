import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getGoofishTargets,
  ingestSnapshots,
  getGoofishReport,
} from '../services/goofishMonitorService'

const SnapshotItemSchema = z.object({
  goofishItemId: z.string().min(1).max(100),
  title: z.string().min(1).max(500),
  priceYuan: z.number().positive().max(100000),
  sellerName: z.string().max(200).nullable(),
  itemUrl: z
    .string()
    .url()
    .regex(/^https:\/\/([^/]+\.)?goofish\.com\//, 'goofish.com 도메인만 허용합니다.'),
  isSuspectFake: z.boolean(),
})

const ProductSnapshotSchema = z.object({
  productId: z.string().uuid(),
  items: z.array(SnapshotItemSchema).max(50),
})

const CreateSnapshotsSchema = z.object({
  collectedAt: z.string().datetime(),
  products: z.array(ProductSnapshotSchema).max(200),
})

export async function getGoofishTargetsHandler(_req: Request, res: Response): Promise<void> {
  const response = await getGoofishTargets()
  res.json(response)
}

export async function createGoofishSnapshotsHandler(req: Request, res: Response): Promise<void> {
  const { collectedAt, products } = CreateSnapshotsSchema.parse(req.body)
  const result = await ingestSnapshots(products, new Date(collectedAt))
  res.status(201).json(result)
}

export async function getGoofishReportHandler(_req: Request, res: Response): Promise<void> {
  const report = await getGoofishReport()
  res.json(report)
}
