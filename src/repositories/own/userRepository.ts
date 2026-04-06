import { prisma } from '../../lib/prisma'
import { AuthProvider } from '@prisma/client'

type CreateUserInput = {
  email: string
  password?: string
  name: string
  phone: string
  phoneVerified: boolean
  provider: AuthProvider
  providerId?: string
}

type UpdateUserPhoneInput = {
  id: string
  phone: string
  phoneVerified: boolean
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export async function findUserByProvider(provider: AuthProvider, providerId: string) {
  return prisma.user.findUnique({
    where: { provider_providerId: { provider, providerId } },
  })
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

export async function findUserByPhone(phone: string) {
  return prisma.user.findUnique({ where: { phone } })
}

export async function createUser(input: CreateUserInput) {
  return prisma.user.create({ data: input })
}

export async function updateUserPhone(input: UpdateUserPhoneInput) {
  return prisma.user.update({
    where: { id: input.id },
    data: { phone: input.phone, phoneVerified: input.phoneVerified },
  })
}
