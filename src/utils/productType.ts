export type ProductType = 'NA' | 'AA' | 'BG'

// 우선순위: BG(배틀그라운드 포함) > 접미사 ' NA' > 접미사 ' AA' > 이름 내 단어 NA > 이름 내 단어 AA
// 접미사 규칙을 먼저 검사해 기존 판별 결과의 회귀를 방지한다.
// \b는 한글·괄호가 단어문자가 아니라 '게임명NA', '게임명(NA)'도 매치되고 'DNA' 같은 오탐은 걸러진다.
export function detectProductType(productName: string): ProductType | null {
  const trimmed = productName.trim()
  if (trimmed.includes('배틀그라운드')) return 'BG'
  if (/ NA$/i.test(trimmed)) return 'NA'
  if (/ AA$/i.test(trimmed)) return 'AA'
  if (/\bNA\b/i.test(trimmed)) return 'NA'
  if (/\bAA\b/i.test(trimmed)) return 'AA'
  return null
}
