import { getSystemSettingsRow, upsertSystemSettings } from '../repositories/systemSettingsRepository'

// 진행중 전환 시 적용하는 전역 기본 소요시간(분) — 선택 가능한 값 목록
export const ALLOWED_DURATION_MINUTES: readonly number[] = [20, 40, 60, 90, 120]

// 설정 행이 없을 때 사용하는 기본값
const DEFAULT_DURATION_MINUTES = 60

type SystemSettingsResult = {
  defaultDurationMinutes: number
}

export async function getSystemSettings(): Promise<SystemSettingsResult> {
  const row = await getSystemSettingsRow()
  return {
    defaultDurationMinutes: row?.defaultDurationMinutes ?? DEFAULT_DURATION_MINUTES,
  }
}

export async function updateSystemSettings(input: {
  defaultDurationMinutes: number
}): Promise<SystemSettingsResult> {
  const row = await upsertSystemSettings({ defaultDurationMinutes: input.defaultDurationMinutes })
  return { defaultDurationMinutes: row.defaultDurationMinutes }
}

// 카카오 챗봇 웰컴 인사말 — 챗봇 메뉴 기능에서 사용
export async function getChatbotWelcomeMessage(): Promise<string | null> {
  const row = await getSystemSettingsRow()
  return row?.chatbotWelcomeMessage ?? null
}

export async function setChatbotWelcomeMessage(message: string | null): Promise<string | null> {
  const row = await upsertSystemSettings({ chatbotWelcomeMessage: message })
  return row.chatbotWelcomeMessage
}
