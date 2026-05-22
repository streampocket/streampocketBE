import {
  FulfillmentStatus,
  SteamOrderItem,
  SteamRegistration,
  SteamRegistrationMatchStatus,
  SteamRegistrationStatus,
} from '@prisma/client'
import { prisma } from '../lib/prisma'

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

type ListRegistrationsInput = {
  status?: SteamRegistrationStatus
  matchStatus?: SteamRegistrationMatchStatus
  page: number
  pageSize: number
}

type ListRegistrationsResult = {
  items: RegistrationWithOrder[]
  total: number
}

export async function createRegistration(
  data: CreateRegistrationInput,
): Promise<SteamRegistration> {
  return prisma.steamRegistration.create({ data })
}

export async function findRegistrationById(
  id: string,
): Promise<RegistrationWithOrder | null> {
  return prisma.steamRegistration.findUnique({
    where: { id },
    include: { orderItem: true },
  })
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

// 멀티턴 되묻기 fallback — 컨텍스트 소실 시 botUserKey로 진행 중 접수를 찾는다.
export async function findLatestNeedsInfoByBotUserKey(
  botUserKey: string,
): Promise<RegistrationWithOrder | null> {
  return prisma.steamRegistration.findFirst({
    where: { botUserKey, status: SteamRegistrationStatus.needs_info },
    orderBy: { createdAt: 'desc' },
    include: { orderItem: true },
  })
}

export async function listRegistrations(
  input: ListRegistrationsInput,
): Promise<ListRegistrationsResult> {
  const where = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.matchStatus ? { matchStatus: input.matchStatus } : {}),
  }
  const [items, total] = await prisma.$transaction([
    prisma.steamRegistration.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (input.page - 1) * input.pageSize,
      take: input.pageSize,
      include: { orderItem: true },
    }),
    prisma.steamRegistration.count({ where }),
  ])
  return { items, total }
}

export async function updateRegistration(
  id: string,
  data: UpdateRegistrationInput,
): Promise<SteamRegistration> {
  return prisma.steamRegistration.update({ where: { id }, data })
}

// 자동매칭 후보 조회 — 구매자 성함 일치 + 게임명 포함 + 처리 전(pending/in_progress) 주문
export async function findOrderItemsForMatch(
  buyerName: string,
  gameName: string,
): Promise<SteamOrderItem[]> {
  return prisma.steamOrderItem.findMany({
    where: {
      source: 'naver', // 스팀 등록 접수는 네이버 챗봇 플로우 — 수동 주문은 매칭 대상 제외
      receiverName: { equals: buyerName, mode: 'insensitive' as const },
      productName: { contains: gameName, mode: 'insensitive' as const },
      fulfillmentStatus: { in: [FulfillmentStatus.pending, FulfillmentStatus.in_progress] },
    },
  })
}
