import {
  findGoofishTargets,
  findAllGoofishMonitored,
  updateGoofishPriceWithRollover,
  type GoofishTarget,
  type GoofishRolloverResult,
} from '../repositories/steamProductRepository'
import { sendDiscordAlert } from '../lib/discord'
import { formatKstDateTime } from '../utils/kst'

export const GOOFISH_MIN_PRICE_YUAN = 15
export const GOOFISH_MAX_ITEMS_PER_PRODUCT = 50
export const GOOFISH_SUSPECT_KEYWORDS = [
  '멀티플레이',
  '온라인',
  '联机',
  '在线',
  'dlc',
  'DLC',
  '독립',
  '독립 실행형',
  '独立',
  '单机',
]

export type GoofishTargetsResponse = {
  targets: GoofishTarget[]
  config: {
    maxItemsPerProduct: number
    minPriceYuan: number
    suspectKeywords: string[]
  }
}

export type SubmittedSnapshotItem = {
  goofishItemId: string
  title: string
  priceYuan: number
  sellerName: string | null
  itemUrl: string
  isSuspectFake: boolean
}

export type SubmittedProductSnapshot = {
  productId: string
  items: SubmittedSnapshotItem[]
}

export type ChangeStatus = 'down' | 'up' | 'same' | 'new' | 'gone' | 'first'

export type ProductChange = {
  productId: string
  name: string
  todayMinYuan: number | null
  prevMinYuan: number | null
  deltaYuan: number | null
  status: ChangeStatus
}

export type SnapshotIngestResult = {
  processed: number
  changed: number
  discordSent: boolean
  changes: ProductChange[]
}

export type GoofishReportItem = {
  productId: string
  name: string
  price: number | null
  todayMinYuan: number | null
  todayCheckedAt: string | null
  prevMinYuan: number | null
  prevCheckedAt: string | null
  deltaYuan: number | null
  status: ChangeStatus
}

export type GoofishReport = {
  fetchedAt: string
  products: GoofishReportItem[]
}

export async function getGoofishTargets(): Promise<GoofishTargetsResponse> {
  const targets = await findGoofishTargets()
  return {
    targets,
    config: {
      maxItemsPerProduct: GOOFISH_MAX_ITEMS_PER_PRODUCT,
      minPriceYuan: GOOFISH_MIN_PRICE_YUAN,
      suspectKeywords: GOOFISH_SUSPECT_KEYWORDS,
    },
  }
}

// 가품 플래그 false이고 15위안 이상인 매물만 최저가 계산에 포함
function pickEligibleMinPrice(items: SubmittedSnapshotItem[]): number | null {
  const eligible = items.filter(
    (it) => !it.isSuspectFake && it.priceYuan >= GOOFISH_MIN_PRICE_YUAN,
  )
  if (eligible.length === 0) return null
  return eligible.reduce((min, it) => (it.priceYuan < min ? it.priceYuan : min), eligible[0]!.priceYuan)
}

function computeChange(row: GoofishRolloverResult): ProductChange {
  const today = row.todayMinYuan
  const prev = row.prevMinYuan
  let status: ChangeStatus
  let delta: number | null = null

  if (prev === null && today !== null) {
    status = 'first'
  } else if (prev === null && today === null) {
    status = 'same'
  } else if (prev !== null && today === null) {
    status = 'gone'
  } else if (prev !== null && today !== null) {
    delta = Number((today - prev).toFixed(2))
    if (delta > 0) status = 'up'
    else if (delta < 0) status = 'down'
    else status = 'same'
  } else {
    status = 'same'
  }

  return {
    productId: row.productId,
    name: row.name,
    todayMinYuan: today,
    prevMinYuan: prev,
    deltaYuan: delta,
    status,
  }
}

function buildDiscordMessage(changes: ProductChange[], collectedAt: Date): string {
  const header = `📊 Goofish 전일비 가격 변동 (${formatKstDateTime(collectedAt)} KST)\n`
  const lines = changes.map((c) => {
    const t = c.todayMinYuan !== null ? `${c.todayMinYuan.toFixed(1)}위안` : '매물 없음'
    const p = c.prevMinYuan !== null ? `${c.prevMinYuan.toFixed(1)}위안` : '매물 없음'
    if (c.status === 'down') {
      return `• ${c.name}: ${p} → ${t} (▼ ${Math.abs(c.deltaYuan ?? 0).toFixed(1)}위안)`
    }
    if (c.status === 'up') {
      return `• ${c.name}: ${p} → ${t} (▲ ${(c.deltaYuan ?? 0).toFixed(1)}위안)`
    }
    if (c.status === 'new') {
      return `• ${c.name}: ${p} → ${t} (신규)`
    }
    if (c.status === 'gone') {
      return `• ${c.name}: ${p} → ${t} (소진)`
    }
    return `• ${c.name}: ${p} → ${t}`
  })
  return header + '\n' + lines.join('\n')
}

// '신규 등장' (prev=null && today !== null && 이전에 수집했는데 매물 없다가 이번에 생긴 것) 보정
// 현 설계는 "prev=null"을 "직전 수집이 없음(=첫 수집)"으로만 해석 → 'first'
// 실운영에서 매물이 없어지면 today가 null로 저장됨 → 다음 수집 때 prev=null, today=값 조합은 첫 수집뿐임
// 따라서 'new' 상태는 별도 보정 불필요 (롤오버 로직상 prev=null은 항상 'first')

export async function ingestSnapshots(
  snapshots: SubmittedProductSnapshot[],
  collectedAt: Date,
): Promise<SnapshotIngestResult> {
  // 각 상품에 대해 최저가 계산 후 롤오버 업데이트
  const results = await Promise.all(
    snapshots.map(async (snap) => {
      const newMin = pickEligibleMinPrice(snap.items)
      const rolled = await updateGoofishPriceWithRollover(snap.productId, newMin, collectedAt)
      return rolled
    }),
  )

  const processed = results.length
  const validResults = results.filter((r): r is GoofishRolloverResult => r !== null)

  // prev가 존재하고 today와 값이 다른 상품만 알림 대상
  const changes: ProductChange[] = validResults
    .map(computeChange)
    .filter((c) => c.status === 'up' || c.status === 'down' || c.status === 'gone')

  let discordSent = false
  if (changes.length > 0) {
    const message = buildDiscordMessage(changes, collectedAt)
    await sendDiscordAlert('stock', message)
    discordSent = true
  }

  return {
    processed,
    changed: changes.length,
    discordSent,
    changes,
  }
}

export async function getGoofishReport(): Promise<GoofishReport> {
  const rows = await findAllGoofishMonitored()
  const products: GoofishReportItem[] = rows.map((r) => {
    const change = computeChange({
      productId: r.productId,
      name: r.name,
      todayMinYuan: r.goofishTodayMinYuan,
      todayCheckedAt: r.goofishTodayCheckedAt,
      prevMinYuan: r.goofishPrevMinYuan,
      prevCheckedAt: r.goofishPrevCheckedAt,
    })
    return {
      productId: r.productId,
      name: r.name,
      price: r.price,
      todayMinYuan: r.goofishTodayMinYuan,
      todayCheckedAt: r.goofishTodayCheckedAt ? r.goofishTodayCheckedAt.toISOString() : null,
      prevMinYuan: r.goofishPrevMinYuan,
      prevCheckedAt: r.goofishPrevCheckedAt ? r.goofishPrevCheckedAt.toISOString() : null,
      deltaYuan: change.deltaYuan,
      status: change.status,
    }
  })

  return {
    fetchedAt: new Date().toISOString(),
    products,
  }
}
