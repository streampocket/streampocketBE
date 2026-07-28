import { sendDiscordAlert } from '../lib/discord'
import { RequestUser } from '../lib/requestUser'
import { formatKstDateTime } from '../utils/kst'

export type UserErrorInput = {
  source: 'be' | 'fe'
  message: string
  path: string
  method?: string
  user: RequestUser | null
  userAgent?: string | null
  stack?: string | null
  digest?: string | null
}

// OTTALL 유저 사이트 경로 여부 — 관리자 경로(/own/admin, /admin/community)는 제외
export function isUserSitePath(path: string): boolean {
  if (path.startsWith('/own/admin/') || path === '/own/admin') return false
  if (path.startsWith('/own/') || path === '/own') return true
  if (path.startsWith('/community/') || path === '/community') return true
  return false
}

// 크롤러·자동화 도구 UA 서명. 봇도 자바스크립트를 실행하므로 fe 에러 경계를 그대로 타서
// 사람과 같은 경로로 오류가 보고된다 (구글봇의 청크 로드 실패가 알림을 채운 사례).
const BOT_UA_PATTERN =
  /bot|crawler|spider|crawling|googlebot|bingbot|yeti|slurp|duckduckbot|facebookexternalhit|lighthouse|headlesschrome|python-requests|curl\//i

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false
  return BOT_UA_PATTERN.test(userAgent)
}

// 같은 오류 반복 발송 방지 — 키별 마지막 발송 시각
const DEDUP_TTL_MS = 5 * 60 * 1000
const DEDUP_MAX_ENTRIES = 200
const dedupMap = new Map<string, number>()

// 전역 발송 상한 — 디스코드 웹훅 rate limit(분당 30건)의 절반
const GLOBAL_LIMIT_PER_MINUTE = 15
let windowStartedAt = 0
let windowCount = 0

function isDuplicate(key: string, now: number): boolean {
  const lastSentAt = dedupMap.get(key)
  if (lastSentAt !== undefined && now - lastSentAt < DEDUP_TTL_MS) return true

  // 만료 항목 정리 (맵 무한 증식 방지)
  if (dedupMap.size >= DEDUP_MAX_ENTRIES) {
    for (const [k, sentAt] of dedupMap) {
      if (now - sentAt >= DEDUP_TTL_MS) dedupMap.delete(k)
    }
  }
  dedupMap.set(key, now)
  return false
}

function isOverGlobalLimit(now: number): boolean {
  if (now - windowStartedAt >= 60 * 1000) {
    windowStartedAt = now
    windowCount = 0
  }
  windowCount += 1
  return windowCount > GLOBAL_LIMIT_PER_MINUTE
}

function buildDescription(input: UserErrorInput): string {
  const lines = [
    `**오류**: ${input.message.slice(0, 500)}`,
    `**출처**: ${input.source === 'be' ? 'BE 서버' : 'FE 화면'}`,
    `**요청**: ${input.method ? `${input.method} ` : ''}${input.path.slice(0, 300)}`,
    `**회원**: ${input.user ? input.user.email || input.user.id : '비회원'}`,
    `**시각**: ${formatKstDateTime()} (KST)`,
  ]
  // 120자면 구글봇 UA가 "Chrome/... M"에서 잘려 정체를 알 수 없었다 (실제로 겪음) — 200자로 확대
  if (input.userAgent) lines.push(`**UA**: ${input.userAgent.slice(0, 200)}`)
  if (input.digest) lines.push(`**digest**: ${input.digest.slice(0, 100)}`)
  if (input.stack) lines.push(`**스택**:\n\`\`\`\n${input.stack.slice(0, 600)}\n\`\`\``)
  return lines.join('\n')
}

// 유저 사이트 오류를 디스코드로 알린다 — fire-and-forget.
// 알림 실패가 원 요청 처리에 영향을 주면 안 되므로 어떤 경로로도 throw하지 않는다.
export function notifyUserSiteError(input: UserErrorInput): void {
  try {
    // 봇 오류는 사람의 피해가 아니므로 디스코드 알림에서 제외한다.
    // 다만 "구글봇이 렌더링에 실패하고 있다"는 SEO 신호는 놓치면 안 되므로 서버 로그에는 남긴다
    // (docker logs streampocket-be | grep BOT_ERROR).
    if (isBotUserAgent(input.userAgent)) {
      console.warn('[BOT_ERROR]', input.source, input.path, input.message.slice(0, 200))
      return
    }

    const now = Date.now()
    const dedupKey = `${input.source}:${input.method ?? ''}:${input.path}:${input.message.slice(0, 200)}`
    if (isDuplicate(dedupKey, now)) return
    if (isOverGlobalLimit(now)) return

    void sendDiscordAlert('userError', buildDescription(input)).catch(() => {})
  } catch {
    // 알림 경로의 오류는 무시 (원 요청 보호)
  }
}
