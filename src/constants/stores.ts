import { Store } from '@prisma/client'

// 멀티스토어 상품 동기화 대상 스토어 목록 — 전체 동기화/루프의 단일 출처.
export const STORES: readonly Store[] = ['streampocket', 'pokemon_steam']

// 기본 스토어 — 기존 단일 스토어 호환(레거시 경로가 store 미지정 시 사용).
export const DEFAULT_STORE: Store = 'streampocket'

// 스토어 표시명 (로그·디스코드 등 사람용 문구).
export const STORE_LABELS: Record<Store, string> = {
  streampocket: '스트림포켓',
  pokemon_steam: '포켓몬스팀',
}
