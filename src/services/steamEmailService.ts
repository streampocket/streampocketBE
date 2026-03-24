import { resend } from '../lib/resend'
import { prisma } from '../lib/prisma'

type SendCodeEmailInput = {
  orderItemId: string
  recipientEmail: string
  productName: string
  codeValue: string
  description: string | null
  caution: string | null
  event: string | null
  paidAt: Date
}

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

function buildEmailBody(input: SendCodeEmailInput): string {
  const lines = [
    `구매일시: ${formatDate(input.paidAt)}`,
    `상품명: ${input.productName}`,
    `상품 코드: ${input.codeValue}`,
    '',
    '[상품 설명]',
    input.description ?? '(없음)',
    '',
    '[이용 주의사항]',
    input.caution ?? '(없음)',
  ]

  if (input.event) {
    lines.push('', '[이벤트]', input.event)
  }

  return lines.join('\n')
}

export async function sendCodeEmail(input: SendCodeEmailInput): Promise<void> {
  const fromAddress = process.env['MAIL_FROM_ADDRESS']
  const fromName = process.env['MAIL_FROM_NAME'] ?? '스트림포켓'
  if (!fromAddress) throw new Error('MAIL_FROM_ADDRESS 환경변수를 설정해 주세요.')

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
      subject: `[구매 완료] ${input.productName}`,
      text: buildEmailBody(input),
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
