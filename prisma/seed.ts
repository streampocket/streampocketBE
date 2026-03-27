import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEFAULT_EMAIL_SUBJECT = '[구매 완료] {productName}'
const DEFAULT_EMAIL_BODY = `구매일시: {purchaseDate}
상품명: {productName}

[스팀 계정 정보]
아이디: {accountUsername}
비밀번호: {accountPassword}

[상품 설명]
{description}

[이용 주의사항]
{caution}
{eventSection}`

async function main(): Promise<void> {
  const email = process.env['ADMIN_EMAIL']
  const password = process.env['ADMIN_PASSWORD']

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL, ADMIN_PASSWORD 환경변수를 설정해 주세요.')
  }

  const existing = await prisma.admin.findUnique({ where: { email } })
  if (existing) {
    console.log(`관리자 계정이 이미 존재합니다: ${email}`)
  } else {
    const hashed = await bcrypt.hash(password, 12)
    const admin = await prisma.admin.create({ data: { email, password: hashed } })
    console.log(`관리자 계정 생성 완료: ${admin.email}`)
  }

  const templateCount = await prisma.emailTemplate.count()
  if (templateCount === 0) {
    await prisma.emailTemplate.create({
      data: { subject: DEFAULT_EMAIL_SUBJECT, bodyTemplate: DEFAULT_EMAIL_BODY },
    })
    console.log('기본 이메일 템플릿 생성 완료')
  } else {
    console.log('이메일 템플릿이 이미 존재합니다')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
