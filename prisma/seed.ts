import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main(): Promise<void> {
  const email = process.env['ADMIN_EMAIL']
  const password = process.env['ADMIN_PASSWORD']

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL, ADMIN_PASSWORD 환경변수를 설정해 주세요.')
  }

  const existing = await prisma.admin.findUnique({ where: { email } })
  if (existing) {
    console.log(`관리자 계정이 이미 존재합니다: ${email}`)
    return
  }

  const hashed = await bcrypt.hash(password, 12)
  const admin = await prisma.admin.create({ data: { email, password: hashed } })
  console.log(`관리자 계정 생성 완료: ${admin.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
