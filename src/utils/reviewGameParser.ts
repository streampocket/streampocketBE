import { Store } from '@prisma/client'

const REVIEW_GAME_PATTERN = /(\d+)\s*\+\s*(\d+)/
// 포켓몬스팀 전용 표기: "리뷰게임 3개" / "리뷰게임3개" / "리뷰 게임 3개"
const POKEMON_REVIEW_GAME_PATTERN = /리뷰\s*게임\s*(\d+)\s*개/

/**
 * 상품명에서 리뷰게임 발송 개수를 추출. 패턴이 없으면 null.
 * - 모든 스토어: "1+N" (예: "게임 1+3" → 3)
 * - pokemon_steam 전용 추가 패턴: "리뷰게임 N개" (1+N 패턴이 없을 때만 적용)
 */
export function parseReviewGameCount(productName: string, store: Store | null): number | null {
  const match = productName.match(REVIEW_GAME_PATTERN)
  if (match) {
    const count = Number(match[2])
    return count > 0 ? count : null
  }

  if (store === 'pokemon_steam') {
    const pokemonMatch = productName.match(POKEMON_REVIEW_GAME_PATTERN)
    if (pokemonMatch) {
      const count = Number(pokemonMatch[1])
      return count > 0 ? count : null
    }
  }

  return null
}
