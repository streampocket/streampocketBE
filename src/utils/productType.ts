export type ProductType = 'NA' | 'AA' | 'BG'

export function detectProductType(productName: string): ProductType | null {
  const trimmed = productName.trim()
  if (trimmed.includes('배틀그라운드')) return 'BG'
  if (/ NA$/i.test(trimmed)) return 'NA'
  if (/ AA$/i.test(trimmed)) return 'AA'
  return null
}
