const REVIEW_GAME_PATTERN = /(\d+)\s*\+\s*(\d+)/

export function parseReviewGameCount(productName: string): number | null {
  const match = productName.match(REVIEW_GAME_PATTERN)
  if (!match) return null

  const count = Number(match[2])
  return count > 0 ? count : null
}
