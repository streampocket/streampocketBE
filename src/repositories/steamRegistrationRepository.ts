import {
  SteamOrderItem,
  SteamRegistration,
  SteamRegistrationMatchStatus,
  SteamRegistrationStatus,
} from '@prisma/client'
import { prisma } from '../lib/prisma'

// 자동 친구링크 기능이 주문별 스팀 자격증명(ID/PW/가드)을 저장·조회·갱신하는 데 사용한다.
// (기존 카카오 챗봇 양식 접수 기능은 제거됨. 본 테이블은 친구링크 자격증명 저장소로 운용.)

export type RegistrationWithOrder = SteamRegistration & {
  orderItem: SteamOrderItem | null
}

type CreateRegistrationInput = {
  orderItemId?: string | null
  steamId?: string | null
  steamPassword?: string | null
  gameName?: string | null
  buyerName?: string | null
  steamGuardCodes?: string | null
  steamGuardDisabled?: boolean | null
  refundConsent: boolean
  rawMessage: string
  formVariant?: string | null
  botUserKey: string
  missingFields: string[]
  matchStatus: SteamRegistrationMatchStatus
  status: SteamRegistrationStatus
}

export type UpdateRegistrationInput = {
  orderItemId?: string | null
  steamId?: string | null
  steamPassword?: string | null
  gameName?: string | null
  buyerName?: string | null
  steamGuardCodes?: string | null
  steamGuardDisabled?: boolean | null
  refundConsent?: boolean
  formVariant?: string | null
  missingFields?: string[]
  matchStatus?: SteamRegistrationMatchStatus
  status?: SteamRegistrationStatus
  adminMemo?: string | null
}

export async function createRegistration(
  data: CreateRegistrationInput,
): Promise<SteamRegistration> {
  return prisma.steamRegistration.create({ data })
}

export async function findRegistrationByOrderItemId(
  orderItemId: string,
): Promise<RegistrationWithOrder | null> {
  return prisma.steamRegistration.findFirst({
    where: { orderItemId },
    orderBy: { createdAt: 'desc' },
    include: { orderItem: true },
  })
}

export async function updateRegistration(
  id: string,
  data: UpdateRegistrationInput,
): Promise<SteamRegistration> {
  return prisma.steamRegistration.update({ where: { id }, data })
}
