/**
 * 양식 C(반자동) 로그인 세션 임시 보관소.
 * - 자격증명 비영속 원칙상 DB를 쓰지 않고 인메모리 Map + TTL로 관리한다.
 * - 단일 EC2 컨테이너 운영 전제(멀티 인스턴스 전환 시 Redis 등 외부 저장소 필요).
 */
import { randomUUID } from 'node:crypto'
import type { PendingLogin } from './steamClient'

const SESSION_TTL_MS = 5 * 60 * 1000 // 폰 승인 대기를 고려해 5분

type StoredSession = {
  login: PendingLogin
  orderItemId: string
  expiresAt: number
}

const store = new Map<string, StoredSession>()

export function putSession(login: PendingLogin, orderItemId: string): string {
  const sessionId = randomUUID()
  store.set(sessionId, { login, orderItemId, expiresAt: Date.now() + SESSION_TTL_MS })
  return sessionId
}

export function getSession(sessionId: string): StoredSession | undefined {
  const found = store.get(sessionId)
  if (!found) return undefined
  if (Date.now() > found.expiresAt) {
    store.delete(sessionId)
    return undefined
  }
  return found
}

export function deleteSession(sessionId: string): void {
  store.delete(sessionId)
}

// 만료 세션 정리 (메모리 누수 방지). unref로 프로세스 종료를 막지 않는다.
setInterval(() => {
  const now = Date.now()
  for (const [id, s] of store.entries()) {
    if (now > s.expiresAt) store.delete(id)
  }
}, 60 * 1000).unref()
