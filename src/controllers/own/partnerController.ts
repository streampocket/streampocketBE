import { Request, Response } from 'express'
import { z } from 'zod'
import {
  applyPartner,
  getMyPartner,
  getPartners,
  getPartnerDetail,
  approvePartner,
  rejectPartner,
  deletePartner,
} from '../../services/own/partnerService'
import { adminDeleteOwnProduct } from '../../services/own/ownProductService'

// ─────────────── Zod 스키마 ───────────────

const applyPartnerSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().min(1).max(20),
  bankName: z.string().min(1).max(50),
  bankAccount: z.string().min(1).max(50),
  agreedToTerms: z.literal(true),
})

const rejectPartnerSchema = z.object({
  rejectionNote: z.string().max(500).optional(),
})

const partnerListQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
})

const idParamSchema = z.object({
  id: z.string().uuid(),
})

const productIdParamSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().uuid(),
})

// ─────────────── 유저용 핸들러 ───────────────

export async function getMyPartnerHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const partner = await getMyPartner(userId)
  res.json({ data: partner })
}

export async function applyPartnerHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const body = applyPartnerSchema.parse(req.body)
  const partner = await applyPartner(userId, {
    name: body.name,
    phone: body.phone,
    bankName: body.bankName,
    bankAccount: body.bankAccount,
  })
  res.status(201).json({ data: partner })
}

// ─────────────── 관리자용 핸들러 ───────────────

export async function adminGetPartnersHandler(req: Request, res: Response): Promise<void> {
  const query = partnerListQuerySchema.parse(req.query)
  const partners = await getPartners(query)
  res.json({ data: partners })
}

export async function adminGetPartnerDetailHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const result = await getPartnerDetail(id)
  res.json({ data: result })
}

export async function adminApprovePartnerHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const partner = await approvePartner(id)
  res.json({ data: partner })
}

export async function adminRejectPartnerHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const body = rejectPartnerSchema.parse(req.body)
  const partner = await rejectPartner(id, body.rejectionNote)
  res.json({ data: partner })
}

export async function adminDeletePartnerHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  await deletePartner(id)
  res.status(204).send()
}

export async function adminForceDeleteProductHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const { productId } = productIdParamSchema.parse(req.params)
  await adminDeleteOwnProduct(productId)
  res.status(204).send()
}
