import { prisma } from '../lib/prisma'
import { Admin } from '@prisma/client'

export async function findAdminByEmail(email: string): Promise<Admin | null> {
  return prisma.admin.findUnique({ where: { email } })
}
