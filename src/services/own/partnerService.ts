import {
  findPartnerByUserId,
  findPartnerById,
  createPartner,
  updatePartner,
  findAllPartners,
  findPartnerDetailWithProducts,
  deletePartnerWithProducts,
} from '../../repositories/own/partnerRepository'
import { sendDiscordAlert } from '../../lib/discord'

const REAPPLY_COOLDOWN_DAYS = 14

type ApplyInput = {
  name: string
  phone: string
  bankName: string
  bankAccount: string
}

type PartnerFilters = {
  status?: 'pending' | 'approved' | 'rejected'
}

export async function applyPartner(userId: string, input: ApplyInput) {
  const existing = await findPartnerByUserId(userId)

  if (existing) {
    if (existing.status === 'approved') {
      throw Object.assign(new Error('이미 승인된 파트너입니다.'), { statusCode: 400 })
    }
    if (existing.status === 'pending') {
      throw Object.assign(new Error('이미 신청 중입니다.'), { statusCode: 400 })
    }
    if (existing.status === 'rejected' && existing.rejectedAt) {
      const daysSinceRejection = Math.floor(
        (Date.now() - new Date(existing.rejectedAt).getTime()) / (1000 * 60 * 60 * 24),
      )
      if (daysSinceRejection < REAPPLY_COOLDOWN_DAYS) {
        const retryDate = new Date(existing.rejectedAt)
        retryDate.setDate(retryDate.getDate() + REAPPLY_COOLDOWN_DAYS)
        throw Object.assign(
          new Error(
            `${retryDate.toLocaleDateString('ko-KR')}부터 재신청 가능합니다.`,
          ),
          { statusCode: 400 },
        )
      }
    }

    const updated = await updatePartner(existing.id, {
      ...input,
      status: 'pending',
      rejectedAt: null,
      rejectionNote: null,
    })

    sendDiscordAlert(
      'partner',
      `**파트너 재신청**\n이름: ${input.name}\n연락처: ${input.phone}`,
    ).catch(() => {})

    return updated
  }

  const partner = await createPartner({ userId, ...input })

  sendDiscordAlert(
    'partner',
    `**신규 파트너 신청**\n이름: ${input.name}\n연락처: ${input.phone}`,
  ).catch(() => {})

  return partner
}

export async function getMyPartner(userId: string) {
  return findPartnerByUserId(userId)
}

export function getPartners(filters: PartnerFilters) {
  return findAllPartners(filters)
}

export async function getPartnerDetail(id: string) {
  const result = await findPartnerDetailWithProducts(id)
  if (!result) {
    throw Object.assign(new Error('파트너를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return result
}

export async function approvePartner(id: string) {
  const partner = await findPartnerById(id)
  if (!partner) {
    throw Object.assign(new Error('파트너를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (partner.status !== 'pending') {
    throw Object.assign(new Error('승인 대기 상태의 파트너만 승인할 수 있습니다.'), {
      statusCode: 400,
    })
  }
  return updatePartner(id, { status: 'approved' })
}

export async function rejectPartner(id: string, rejectionNote?: string) {
  const partner = await findPartnerById(id)
  if (!partner) {
    throw Object.assign(new Error('파트너를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (partner.status !== 'pending') {
    throw Object.assign(new Error('승인 대기 상태의 파트너만 거절할 수 있습니다.'), {
      statusCode: 400,
    })
  }
  return updatePartner(id, {
    status: 'rejected',
    rejectedAt: new Date(),
    rejectionNote: rejectionNote ?? null,
  })
}

export async function deletePartner(id: string) {
  const partner = await findPartnerById(id)
  if (!partner) {
    throw Object.assign(new Error('파트너를 찾을 수 없습니다.'), { statusCode: 404 })
  }
  await deletePartnerWithProducts(id, partner.userId)
}
