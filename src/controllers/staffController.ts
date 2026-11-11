import { Request, Response } from 'express'
import { z } from 'zod'
import { ADMIN_PERMISSION_KEYS } from '../constants/adminPermissions'
import {
  createStaff,
  listStaff,
  removeStaff,
  resetStaffPassword,
  updateStaff,
} from '../services/staffService'

const idParamSchema = z.object({ id: z.string().uuid('잘못된 계정 ID입니다.') })

const passwordSchema = z
  .string()
  .min(8, '비밀번호는 8자 이상이어야 합니다.')
  .max(72, '비밀번호는 72자 이하여야 합니다.')

// 중복 키는 한 번만 저장
const permissionsSchema = z
  .array(z.enum(ADMIN_PERMISSION_KEYS, { message: '알 수 없는 권한입니다.' }))
  .transform((keys) => [...new Set(keys)])

const createStaffSchema = z.object({
  email: z.string().trim().toLowerCase().email('이메일 형식이 올바르지 않습니다.'),
  password: passwordSchema,
  permissions: permissionsSchema,
})

const updateStaffSchema = z
  .object({
    permissions: permissionsSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => v.permissions !== undefined || v.isActive !== undefined, {
    message: '변경할 항목이 없습니다.',
  })

const resetPasswordSchema = z.object({ password: passwordSchema })

export async function listStaffHandler(_req: Request, res: Response): Promise<void> {
  res.json({ data: await listStaff() })
}

export async function createStaffHandler(req: Request, res: Response): Promise<void> {
  const body = createStaffSchema.parse(req.body)
  res.status(201).json({ data: await createStaff(body) })
}

export async function updateStaffHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const body = updateStaffSchema.parse(req.body)
  res.json({ data: await updateStaff(id, body) })
}

export async function resetStaffPasswordHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const { password } = resetPasswordSchema.parse(req.body)
  await resetStaffPassword(id, password)
  res.status(204).end()
}

export async function deleteStaffHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  await removeStaff(id)
  res.status(204).end()
}
