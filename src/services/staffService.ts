import bcrypt from 'bcryptjs'
import { Admin, Prisma } from '@prisma/client'
import {
  createAdmin,
  deleteAdmin,
  findAdminById,
  findAdminsByRole,
  updateAdmin,
} from '../repositories/adminRepository'
import type { AdminPermission } from '../constants/adminPermissions'

// seed.ts와 같은 강도
const BCRYPT_ROUNDS = 12

export type StaffView = {
  id: string
  email: string
  permissions: string[]
  isActive: boolean
  createdAt: Date
}

function toView(admin: Admin): StaffView {
  return {
    id: admin.id,
    email: admin.email,
    permissions: admin.permissions,
    isActive: admin.isActive,
    createdAt: admin.createdAt,
  }
}

function httpError(message: string, statusCode: number): Error {
  return Object.assign(new Error(message), { statusCode })
}

// 직원 계정만 다룬다 — 사장(owner) 계정은 이 API로 수정·비활성·삭제할 수 없다
async function findStaffOrThrow(id: string): Promise<Admin> {
  const admin = await findAdminById(id)
  if (!admin || admin.role !== 'staff') throw httpError('직원 계정을 찾을 수 없습니다.', 404)
  return admin
}

export async function listStaff(): Promise<StaffView[]> {
  const staff = await findAdminsByRole('staff')
  return staff.map(toView)
}

type CreateStaffInput = {
  email: string
  password: string
  permissions: AdminPermission[]
}

export async function createStaff(input: CreateStaffInput): Promise<StaffView> {
  const password = await bcrypt.hash(input.password, BCRYPT_ROUNDS)
  try {
    const admin = await createAdmin({
      email: input.email,
      password,
      role: 'staff',
      permissions: input.permissions,
    })
    return toView(admin)
  } catch (err) {
    // 이메일 unique 위반 — 사장 계정 이메일과 겹쳐도 같은 문구 (계정 존재 여부만 알려줌)
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
      throw httpError('이미 사용 중인 이메일입니다.', 409)
    }
    throw err
  }
}

type UpdateStaffInput = {
  permissions?: AdminPermission[]
  isActive?: boolean
}

export async function updateStaff(id: string, input: UpdateStaffInput): Promise<StaffView> {
  await findStaffOrThrow(id)
  const admin = await updateAdmin(id, input)
  return toView(admin)
}

export async function resetStaffPassword(id: string, newPassword: string): Promise<void> {
  await findStaffOrThrow(id)
  const password = await bcrypt.hash(newPassword, BCRYPT_ROUNDS)
  await updateAdmin(id, { password })
}

export async function removeStaff(id: string): Promise<void> {
  await findStaffOrThrow(id)
  // 직원이 쓴 공지글은 남는다 (CommunityPost.authorAdmin onDelete: SetNull)
  await deleteAdmin(id)
}
