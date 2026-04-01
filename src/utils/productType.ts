export type ProductType = 'NA' | 'AA'

export function detectProductType(productName: string): ProductType | null {
  const trimmed = productName.trim()
  if (/ NA$/i.test(trimmed)) return 'NA'
  if (/ AA$/i.test(trimmed)) return 'AA'
  return null
}
