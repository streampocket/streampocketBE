import { prisma } from '../../lib/prisma'

type CreatePartnerInput = {
  userId: string
  name: string
  phone: string
  bankName: string
  bankAccount: string
}

type UpdatePartnerInput = {
  name?: string
  phone?: string
  bankName?: string
  bankAccount?: string
  status?: 'pending' | 'approved' | 'rejected'
  rejectedAt?: Date | null
  rejectionNote?: string | null
}

const partnerInclude = {
  user: { select: { id: true, email: true, name: true } },
} as const // 단언 사유: Prisma include 객체를 리터럴 타입으로 고정

export function findPartnerByUserId(userId: string) {
  return prisma.partner.findUnique({
    where: { userId },
    include: partnerInclude,
  })
}

export function findPartnerById(id: string) {
  return prisma.partner.findUnique({
    where: { id },
    include: partnerInclude,
  })
}

export function createPartner(data: CreatePartnerInput) {
  return prisma.partner.create({
    data,
    include: partnerInclude,
  })
}

export function updatePartner(id: string, data: UpdatePartnerInput) {
  return prisma.partner.update({
    where: { id },
    data,
    include: partnerInclude,
  })
}

type PartnerFilters = {
  status?: 'pending' | 'approved' | 'rejected'
}

export function findAllPartners(filters: PartnerFilters) {
  return prisma.partner.findMany({
    where: {
      ...(filters.status ? { status: filters.status } : {}),
    },
    include: partnerInclude,
    orderBy: { createdAt: 'desc' },
  })
}

export async function findPartnerDetailWithProducts(id: string) {
  const partner = await prisma.partner.findUnique({
    where: { id },
    include: {
      ...partnerInclude,
    },
  })
  if (!partner) return null

  const products = await prisma.ownProduct.findMany({
    where: { userId: partner.userId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  return { partner, products }
}

export function deletePartnerWithProducts(partnerId: string, userId: string) {
  return prisma.$transaction([
    prisma.ownProduct.deleteMany({ where: { userId } }),
    prisma.partner.delete({ where: { id: partnerId } }),
  ])
}
