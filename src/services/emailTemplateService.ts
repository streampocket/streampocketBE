import {
  getEmailTemplate,
  upsertEmailTemplate,
} from '../repositories/emailTemplateRepository'

const DEFAULT_SUBJECT = '[구매 완료] {productName}'
const DEFAULT_BODY = `구매일시: {purchaseDate}
상품명: {productName}

[스팀 계정 정보]
아이디: {accountUsername}
비밀번호: {accountPassword}

[상품 설명]
{description}

[이용 주의사항]
{caution}
{eventSection}`

export async function getTemplate() {
  const template = await getEmailTemplate()
  return template ?? { subject: DEFAULT_SUBJECT, bodyTemplate: DEFAULT_BODY }
}

export async function updateTemplate(subject: string, bodyTemplate: string) {
  return upsertEmailTemplate(subject, bodyTemplate)
}
