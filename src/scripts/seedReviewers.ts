import { PrismaClient, type Prisma } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PARTY_APPLICATION_FEE } from '../constants/fees'

const prisma = new PrismaClient()

// ─────────────────────────── 시드 데이터 정의 ───────────────────────────

const REVIEWER_PASSWORD = 'reviewer1234!'
const REVIEWER_PHONE_PREFIX = '010-0500-'
const REVIEWER_EMAIL_PREFIX = 'reviewer'
const REVIEWER_EMAIL_DOMAIN = '@ottall.com'

const REVIEWER_NAMES = [
  '김민지', '이준호', '박서연', '정현우', '최지원',
  '강민준', '윤서아', '임도윤', '한지유', '송예준',
  '오시우', '장하윤', '권하준', '황은우', '안지호',
  '서민서', '신주원', '류태이', '배소율', '노이안',
  '유시현', '백채원', '홍건우', '문윤서', '양주안',
  '손유나', '조서윤', '남예린', '심도현', '고예나',
] as const // 단언 사유: 한국 이름 30개 고정 리스트, 인덱스 안전성을 위한 const tuple

const LEADER_NAMES = [
  '김민우', '임정빈', '정수연', '박재훈', '윤하늘',
  '이주영', '송다은', '강민호', '한채린', '조성민',
] as const // 단언 사유: 회원 30명과 겹치지 않는 파티장 이름 10개

type SeedProduct = {
  categoryName: string
  productName: string
  durationDays: number
  price: number
  imagePath: string
}

// 카테고리명 기준으로 운영 OwnCategory와 매칭 (실행 시점에 ID 조회).
const SEED_PRODUCTS: SeedProduct[] = [
  { categoryName: '드라마 박스', productName: '드라마 박스 30일 공유', durationDays: 30, price: 8000, imagePath: '/images/ott/drama-box.png' },
  { categoryName: '드라마 박스', productName: '드라마 박스 한 달 모임', durationDays: 30, price: 14000, imagePath: '/images/ott/drama-box.png' },
  { categoryName: '비글루', productName: '비글루 30일 공유', durationDays: 30, price: 9000, imagePath: '/images/ott/bigloo.png' },
  { categoryName: '비글루', productName: '비글루 한 달 모임', durationDays: 30, price: 16000, imagePath: '/images/ott/bigloo.png' },
  { categoryName: '릴숏', productName: '릴숏 30일 공유', durationDays: 30, price: 13000, imagePath: '/images/ott/reelshort.jpg' },
  { categoryName: '릴숏', productName: '릴숏 한 달 모임', durationDays: 30, price: 18000, imagePath: '/images/ott/reelshort.jpg' },
  { categoryName: '드라마 웨이브', productName: '드라마 웨이브 30일 공유', durationDays: 30, price: 7000, imagePath: '/images/ott/drama-wave.jpg' },
  { categoryName: '드라마 웨이브', productName: '드라마 웨이브 한 달 모임', durationDays: 30, price: 13000, imagePath: '/images/ott/drama-wave.jpg' },
  { categoryName: '넷숏', productName: '넷숏 30일 공유', durationDays: 30, price: 15000, imagePath: '/images/ott/netshot.png' },
  { categoryName: '넷숏', productName: '넷숏 한 달 모임', durationDays: 30, price: 19000, imagePath: '/images/ott/netshot.png' },
]

const SLOTS_PER_PRODUCT = 3
const STARTED_AT_OFFSET_DAYS = 7

// ─────────────────────────── 메인 로직 ───────────────────────────

async function main(): Promise<void> {
  if (REVIEWER_NAMES.length !== 30) {
    throw new Error('REVIEWER_NAMES는 정확히 30개여야 합니다.')
  }
  if (SEED_PRODUCTS.length !== 10) {
    throw new Error('SEED_PRODUCTS는 정확히 10개여야 합니다.')
  }
  if (LEADER_NAMES.length !== SEED_PRODUCTS.length) {
    throw new Error('LEADER_NAMES 개수와 SEED_PRODUCTS 개수가 일치해야 합니다.')
  }
  if (REVIEWER_NAMES.length !== SEED_PRODUCTS.length * SLOTS_PER_PRODUCT) {
    throw new Error('회원 수가 상품 수 × 슬롯과 일치해야 합니다.')
  }

  const passwordHash = await bcrypt.hash(REVIEWER_PASSWORD, 12)

  await prisma.$transaction(async (tx) => {
    // 1) 카테고리 조회
    const categoryNames = Array.from(new Set(SEED_PRODUCTS.map((p) => p.categoryName)))
    const categories = await tx.ownCategory.findMany({
      where: { name: { in: categoryNames } },
      select: { id: true, name: true },
    })
    const categoryByName = new Map(categories.map((c) => [c.name, c.id]))
    const missing = categoryNames.filter((n) => !categoryByName.has(n))
    if (missing.length > 0) {
      throw new Error(`다음 카테고리가 운영에 없습니다: ${missing.join(', ')}`)
    }

    // 2) 상품 10개 upsert (categoryId + name 기준)
    const productIds: string[] = []
    const startedAt = new Date(Date.now() - STARTED_AT_OFFSET_DAYS * 24 * 60 * 60 * 1000)
    for (let i = 0; i < SEED_PRODUCTS.length; i += 1) {
      const seed = SEED_PRODUCTS[i]!
      const leaderName = LEADER_NAMES[i]!
      const categoryId = categoryByName.get(seed.categoryName)!

      const existing = await tx.ownProduct.findFirst({
        where: { categoryId, name: seed.productName },
        select: { id: true },
      })
      if (existing) {
        productIds.push(existing.id)
        console.log(`  [상품] 재사용: ${seed.productName} (${existing.id})`)
        continue
      }

      const created = await tx.ownProduct.create({
        data: {
          categoryId,
          name: seed.productName,
          durationDays: seed.durationDays,
          price: seed.price,
          dailyDiscount: 0,
          totalSlots: SLOTS_PER_PRODUCT,
          filledSlots: SLOTS_PER_PRODUCT,
          imagePath: seed.imagePath,
          notes: null,
          accountId: null,
          accountPassword: null,
          status: 'closed',
          startedAt,
          leaderName,
        },
        select: { id: true },
      })
      productIds.push(created.id)
      console.log(`  [상품] 생성: ${seed.productName} (${created.id})`)
    }

    // 3) 회원 30명 upsert (email 기준)
    const userIds: string[] = []
    for (let i = 0; i < REVIEWER_NAMES.length; i += 1) {
      const idx = i + 1
      const email = `${REVIEWER_EMAIL_PREFIX}${idx}${REVIEWER_EMAIL_DOMAIN}`
      const phone = `${REVIEWER_PHONE_PREFIX}${String(idx).padStart(4, '0')}`
      const name = REVIEWER_NAMES[i]!

      const existing = await tx.user.findUnique({
        where: { email },
        select: { id: true },
      })
      if (existing) {
        userIds.push(existing.id)
        console.log(`  [회원] 재사용: ${email}`)
        continue
      }

      const created = await tx.user.create({
        data: {
          email,
          password: passwordHash,
          name,
          phone,
          phoneVerified: true,
          provider: 'local',
          termsAgreements: {
            create: [
              { type: 'service' },
              { type: 'privacy' },
            ],
          },
        },
        select: { id: true },
      })
      userIds.push(created.id)
      console.log(`  [회원] 생성: ${email} / ${name}`)
    }

    // 4) PartyApplication 30건 (상품당 3명 순서 분배, status='confirmed')
    let applicationCount = 0
    for (let pIdx = 0; pIdx < productIds.length; pIdx += 1) {
      const productId = productIds[pIdx]!
      const seed = SEED_PRODUCTS[pIdx]!
      const price = seed.price
      const fee = PARTY_APPLICATION_FEE
      const totalAmount = price + fee
      const productStartedAt = startedAt
      const productExpiresAt = new Date(
        productStartedAt.getTime() + seed.durationDays * 24 * 60 * 60 * 1000,
      )

      for (let slot = 0; slot < SLOTS_PER_PRODUCT; slot += 1) {
        const userIdx = pIdx * SLOTS_PER_PRODUCT + slot
        const userId = userIds[userIdx]!

        const existing = await tx.partyApplication.findUnique({
          where: { productId_userId: { productId, userId } },
          select: { id: true, status: true },
        })
        if (existing) {
          console.log(`  [신청] 재사용: product=${productId.slice(0, 8)} user=${userId.slice(0, 8)} (${existing.status})`)
          continue
        }

        const data: Prisma.PartyApplicationUncheckedCreateInput = {
          productId,
          userId,
          price,
          fee,
          totalAmount,
          status: 'confirmed',
          startedAt: productStartedAt,
          expiresAt: productExpiresAt,
        }
        await tx.partyApplication.create({ data })
        applicationCount += 1
      }
    }

    console.log(`\n[요약] 상품: ${productIds.length} / 회원: ${userIds.length} / 신규 신청: ${applicationCount}`)
  })
}

main()
  .then(() => {
    console.log('✓ 리뷰용 시드 완료')
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
