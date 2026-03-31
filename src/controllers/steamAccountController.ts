import { Request, Response } from 'express'
import { z } from 'zod'
import {
  getAccounts,
  bulkCreate,
  disable,
  exportAccountsForExcel,
  updateAccount,
  deleteAccount,
} from '../services/steamAccountService'
import { buildAccountExcelBuffer } from '../utils/excel'

const bulkCreateSchema = z.object({
  productId: z.string().uuid(),
  accounts: z
    .array(
      z.object({
        username: z.string().min(1),
        password: z.string().min(1),
        email: z.string().min(1),
        emailPassword: z.string().min(1),
        emailSiteUrl: z.string().min(1),
      }),
    )
    .min(1),
})

const listQuerySchema = z.object({
  productId: z.string().uuid().optional(),
  status: z.enum(['available', 'reserved', 'sent', 'disabled']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
})

export async function getAccountsHandler(req: Request, res: Response): Promise<void> {
  const query = listQuerySchema.parse(req.query)
  const result = await getAccounts(query)
  res.json({
    data: result.items,
    total: result.total,
    page: query.page,
    pageSize: query.pageSize,
    totalPages: Math.ceil(result.total / query.pageSize),
  })
}

const exportAccountQuerySchema = z.object({
  productId: z.string().uuid().optional(),
  status: z.enum(['available', 'reserved', 'sent', 'disabled']).optional(),
})

const updateAccountBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
  email: z.string().min(1),
  emailPassword: z.string().min(1),
  emailSiteUrl: z.string().min(1),
})

export async function exportAccountsHandler(req: Request, res: Response): Promise<void> {
  const query = exportAccountQuerySchema.parse(req.query)
  const accounts = await exportAccountsForExcel({
    productId: query.productId,
    status: query.status,
  })
  const buffer = buildAccountExcelBuffer(
    accounts.map((a) => ({
      productName: a.product.name ?? '삭제된 상품',
      username: a.username,
      password: a.password,
      email: a.email,
      emailPassword: a.emailPassword,
      emailSiteUrl: a.emailSiteUrl,
      status: a.status,
      sentAt: a.sentAt,
      createdAt: a.createdAt,
    })),
  )
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="accounts_${date}.xlsx"`)
  res.send(buffer)
}

export async function bulkCreateAccountsHandler(req: Request, res: Response): Promise<void> {
  const body = bulkCreateSchema.parse(req.body)
  const result = await bulkCreate(body)
  res.status(201).json({ data: result })
}

export async function disableAccountHandler(
  req: Request<{ id: string }>,
  res: Response,
): Promise<void> {
  const { id } = req.params
  const account = await disable(id)
  res.json({ data: account })
}

export async function updateAccountHandler(req: Request<{ id: string }>, res: Response): Promise<void> {
  const { id } = req.params
  const body = updateAccountBodySchema.parse(req.body)
  const account = await updateAccount(id, body)
  res.status(200).json({ data: account })
}

export async function deleteAccountHandler(req: Request<{ id: string }>, res: Response): Promise<void> {
  const { id } = req.params
  await deleteAccount(id)
  res.status(204).send()
}
