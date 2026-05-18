import {
  SteamOrderItem,
  SteamRegistrationMatchStatus,
  SteamRegistrationStatus,
} from '@prisma/client'
import { sendDiscordAlert } from '../lib/discord'
import { parseSteamRegistration } from '../utils/steamRegistrationParser'
import {
  RegistrationWithOrder,
  UpdateRegistrationInput,
  createRegistration,
  findLatestNeedsInfoByBotUserKey,
  findOrderItemsForMatch,
  findRegistrationById,
  findRegistrationByOrderItemId,
  listRegistrations as listRegistrationsRepo,
  updateRegistration,
} from '../repositories/steamRegistrationRepository'
import { findOrderById } from '../repositories/steamOrderRepository'

export type RegistrationSubmitResult = {
  registration: RegistrationWithOrder
  missingFields: string[]
  matchedOrder: SteamOrderItem | null
}

export type RegistrationAnswerResult = {
  found: boolean
  registration: RegistrationWithOrder | null
  missingFields: string[]
  matchedOrder: SteamOrderItem | null
}

type AdminUpdateInput = {
  steamId?: string | null
  steamPassword?: string | null
  gameName?: string | null
  buyerName?: string | null
  steamGuardCodes?: string | null
  steamGuardDisabled?: boolean | null
  refundConsent?: boolean
  adminMemo?: string | null
  status?: SteamRegistrationStatus
}

function notFound(): Error {
  return Object.assign(new Error('스팀 등록 접수 정보를 찾을 수 없습니다.'), { statusCode: 404 })
}

// 구매자 성함 + 게임명으로 주문 자동매칭 — 후보가 정확히 1건일 때만 연결한다.
async function attemptAutoMatch(
  buyerName: string | null,
  gameName: string | null,
): Promise<SteamOrderItem | null> {
  if (!buyerName || !gameName) return null
  const candidates = await findOrderItemsForMatch(buyerName, gameName)
  return candidates.length === 1 ? candidates[0] : null
}

// Discord 알림 — 비밀번호는 절대 포함하지 않는다. 알림 실패는 접수 흐름을 막지 않는다.
async function notifyDiscord(
  registration: RegistrationWithOrder,
  matchedOrder: SteamOrderItem | null,
): Promise<void> {
  const lines = [
    `구매자: ${registration.buyerName ?? '미파악'}`,
    `게임: ${registration.gameName ?? '미파악'}`,
    `매칭: ${matchedOrder ? `자동매칭 (${matchedOrder.productOrderId})` : '미연결'}`,
  ]
  if (registration.missingFields.length > 0) {
    lines.push(`누락 항목: ${registration.missingFields.join(', ')}`)
  }
  try {
    await sendDiscordAlert('order', `🎮 스팀 등록 접수\n${lines.join('\n')}`)
  } catch {
    // 알림 실패는 무시
  }
}

// 챗봇 양식 접수 — 파싱 → 자동매칭 → 저장 → Discord 알림
export async function submitRegistration(
  rawMessage: string,
  botUserKey: string,
): Promise<RegistrationSubmitResult> {
  const { fields, formVariant, missingFields } = parseSteamRegistration(rawMessage)
  const matchedOrder = await attemptAutoMatch(fields.buyerName, fields.gameName)

  const created = await createRegistration({
    orderItemId: matchedOrder?.id ?? null,
    steamId: fields.steamId,
    steamPassword: fields.steamPassword,
    gameName: fields.gameName,
    buyerName: fields.buyerName,
    steamGuardCodes: fields.steamGuardCodes,
    steamGuardDisabled: fields.steamGuardDisabled,
    refundConsent: fields.refundConsent,
    rawMessage,
    formVariant,
    botUserKey,
    missingFields,
    matchStatus: matchedOrder
      ? SteamRegistrationMatchStatus.auto_matched
      : SteamRegistrationMatchStatus.unmatched,
    status:
      missingFields.length > 0
        ? SteamRegistrationStatus.needs_info
        : SteamRegistrationStatus.received,
  })

  const registration = await findRegistrationById(created.id)
  if (!registration) throw notFound()

  await notifyDiscord(registration, matchedOrder)

  return { registration, missingFields, matchedOrder }
}

// 멀티턴 되묻기 답변 처리 — 진행 중 접수의 첫 누락 항목을 채운다.
export async function answerMissingField(
  botUserKey: string,
  value: string,
): Promise<RegistrationAnswerResult> {
  const registration = await findLatestNeedsInfoByBotUserKey(botUserKey)
  if (!registration) {
    return { found: false, registration: null, missingFields: [], matchedOrder: null }
  }

  const trimmed = value.trim()
  const missing = [...registration.missingFields]
  const currentField = missing.shift()

  let buyerName = registration.buyerName
  let gameName = registration.gameName
  const update: UpdateRegistrationInput = {}

  if (currentField && trimmed.length > 0) {
    switch (currentField) {
      case 'steamId':
        update.steamId = trimmed
        break
      case 'steamPassword':
        update.steamPassword = trimmed
        break
      case 'gameName':
        update.gameName = trimmed
        gameName = trimmed
        break
      case 'buyerName':
        update.buyerName = trimmed
        buyerName = trimmed
        break
      default:
        break
    }
  } else if (currentField) {
    // 빈 답변 — 해당 항목을 다시 누락으로 남긴다.
    missing.unshift(currentField)
  }

  update.missingFields = missing

  // 재매칭 — 아직 미연결이고 성함·게임명이 모두 확보된 경우
  let matchedOrder: SteamOrderItem | null = registration.orderItem
  if (!matchedOrder && registration.matchStatus === SteamRegistrationMatchStatus.unmatched) {
    matchedOrder = await attemptAutoMatch(buyerName, gameName)
    if (matchedOrder) {
      update.orderItemId = matchedOrder.id
      update.matchStatus = SteamRegistrationMatchStatus.auto_matched
    }
  }

  if (missing.length === 0) {
    update.status = SteamRegistrationStatus.received
  }

  await updateRegistration(registration.id, update)
  const updated = await findRegistrationById(registration.id)
  if (!updated) throw notFound()

  return { found: true, registration: updated, missingFields: missing, matchedOrder }
}

// ───────────────────────── 관리자용 ─────────────────────────

export async function listRegistrations(input: {
  status?: SteamRegistrationStatus
  matchStatus?: SteamRegistrationMatchStatus
  page: number
  pageSize: number
}): Promise<{ items: RegistrationWithOrder[]; total: number }> {
  return listRegistrationsRepo(input)
}

export async function getRegistrationDetail(id: string): Promise<RegistrationWithOrder> {
  const registration = await findRegistrationById(id)
  if (!registration) throw notFound()
  return registration
}

// 주문 상세 모달용 — 연결된 접수가 없으면 null (오류 아님)
export async function getRegistrationByOrderItem(
  orderItemId: string,
): Promise<RegistrationWithOrder | null> {
  return findRegistrationByOrderItemId(orderItemId)
}

export async function updateRegistrationByAdmin(
  id: string,
  data: AdminUpdateInput,
): Promise<RegistrationWithOrder> {
  const existing = await findRegistrationById(id)
  if (!existing) throw notFound()

  // 병합 후 필수 항목 기준으로 누락 목록 재계산
  const steamId = data.steamId !== undefined ? data.steamId : existing.steamId
  const steamPassword =
    data.steamPassword !== undefined ? data.steamPassword : existing.steamPassword
  const gameName = data.gameName !== undefined ? data.gameName : existing.gameName
  const buyerName = data.buyerName !== undefined ? data.buyerName : existing.buyerName

  const missingFields: string[] = []
  if (!steamId) missingFields.push('steamId')
  if (!steamPassword) missingFields.push('steamPassword')
  if (!gameName) missingFields.push('gameName')
  if (!buyerName) missingFields.push('buyerName')

  // 상태 — 명시값 우선, 없으면 누락 해소 시 needs_info → received 로 승격
  let status = data.status
  if (!status && missingFields.length === 0 && existing.status === SteamRegistrationStatus.needs_info) {
    status = SteamRegistrationStatus.received
  }

  await updateRegistration(id, {
    steamId: data.steamId,
    steamPassword: data.steamPassword,
    gameName: data.gameName,
    buyerName: data.buyerName,
    steamGuardCodes: data.steamGuardCodes,
    steamGuardDisabled: data.steamGuardDisabled,
    refundConsent: data.refundConsent,
    adminMemo: data.adminMemo,
    missingFields,
    ...(status ? { status } : {}),
  })

  const updated = await findRegistrationById(id)
  if (!updated) throw notFound()
  return updated
}

export async function linkOrder(
  registrationId: string,
  orderItemId: string,
): Promise<RegistrationWithOrder> {
  const registration = await findRegistrationById(registrationId)
  if (!registration) throw notFound()

  const order = await findOrderById(orderItemId)
  if (!order) {
    throw Object.assign(new Error('연결할 주문을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  await updateRegistration(registrationId, {
    orderItemId,
    matchStatus: SteamRegistrationMatchStatus.manual_matched,
  })

  const updated = await findRegistrationById(registrationId)
  if (!updated) throw notFound()
  return updated
}

export async function unlinkOrder(registrationId: string): Promise<RegistrationWithOrder> {
  const registration = await findRegistrationById(registrationId)
  if (!registration) throw notFound()

  await updateRegistration(registrationId, {
    orderItemId: null,
    matchStatus: SteamRegistrationMatchStatus.unmatched,
  })

  const updated = await findRegistrationById(registrationId)
  if (!updated) throw notFound()
  return updated
}
