import { prisma } from '../lib/prisma'
import { Admin, AdminRole } from '@prisma/client'

export async function findAdminByEmail(email: string): Promise<Admin | null> {
  return prisma.admin.findUnique({ where: { email } })
}

export async function findAdminById(id: string): Promise<Admin | null> {
  return prisma.admin.findUnique({ where: { id } })
}

export async function findAdminsByRole(role: AdminRole): Promise<Admin[]> {
  return prisma.admin.findMany({ where: { role }, orderBy: { createdAt: 'asc' } })
}

type CreateAdminData = {
  email: string
  password: string
  role: AdminRole
  permissions: string[]
}

export async function createAdmin(data: CreateAdminData): Promise<Admin> {
  return prisma.admin.create({ data })
}

type UpdateAdminData = {
  password?: string
  permissions?: string[]
  isActive?: boolean
}

export async function updateAdmin(id: string, data: UpdateAdminData): Promise<Admin> {
  return prisma.admin.update({ where: { id }, data })
}

export async function deleteAdmin(id: string): Promise<void> {
  await prisma.admin.delete({ where: { id } })
}
