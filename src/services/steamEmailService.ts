import { resend } from '../lib/resend'
import { prisma } from '../lib/prisma'

type SendCodeEmailInput = {
  orderItemId: string
  recipientEmail: string
  productName: string
  accountUsername: string
  accountPassword: string
  accountEmail: string
  accountEmailPassword: string
  accountEmailSiteUrl: string
  paidAt: Date
}

const FALLBACK_SUBJECT = '[구매 완료] {productName}'
const FALLBACK_BODY = `구매일시: {purchaseDate}
상품명: {productName}

[계정 정보]
아이디: {accountUsername}
비밀번호: {accountPassword}
이메일: {accountEmail}
이메일 비밀번호: {accountEmailPassword}
이메일 사이트: {accountEmailSiteUrl}`

function formatDate(date: Date): string {
  return date.toLocaleString('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

function applyTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template,
  )
}

async function getTemplate(): Promise<{ subject: string; bodyTemplate: string }> {
  const template = await prisma.emailTemplate.findFirst()
  return template ?? { subject: FALLBACK_SUBJECT, bodyTemplate: FALLBACK_BODY }
}

export async function sendCodeEmail(input: SendCodeEmailInput): Promise<void> {
  const fromAddress = process.env['MAIL_FROM_ADDRESS']
  const fromName = process.env['MAIL_FROM_NAME'] ?? '스트림포켓'
  if (!fromAddress) throw new Error('MAIL_FROM_ADDRESS 환경변수를 설정해 주세요.')

  const { subject: subjectTemplate, bodyTemplate } = await getTemplate()

  const vars: Record<string, string> = {
    purchaseDate: formatDate(input.paidAt),
    productName: input.productName,
    accountUsername: input.accountUsername,
    accountPassword: input.accountPassword,
    accountEmail: input.accountEmail,
    accountEmailPassword: input.accountEmailPassword,
    accountEmailSiteUrl: input.accountEmailSiteUrl,
  }

  const subject = applyTemplate(subjectTemplate, vars)
  const body = applyTemplate(bodyTemplate, vars)

  // 발송 이력 먼저 생성 (queued)
  const emailLog = await prisma.emailLog.create({
    data: {
      orderItemId: input.orderItemId,
      recipientEmail: input.recipientEmail,
      status: 'queued',
    },
  })

  try {
    await resend.emails.send({
      from: `${fromName} <${fromAddress}>`,
      to: input.recipientEmail,
      subject,
      text: body,
    })

    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'sent', sentAt: new Date() },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    await prisma.emailLog.update({
      where: { id: emailLog.id },
      data: { status: 'failed', errorMessage: message },
    })
    throw err
  }
}
