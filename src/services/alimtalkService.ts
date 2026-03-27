import { z } from 'zod'
import {
  getAlimtalkSettings as getAlimtalkSettingsRecord,
  upsertAlimtalkSettings,
} from '../repositories/alimtalkSettingsRepository'
import { createDeliveryLog, updateDeliveryLog } from '../repositories/deliveryLogRepository'

type SendOrderAlimtalkInput = {
  orderItemId: string
  recipientPhoneNumber: string
  recipientName: string | null
  productName: string
  accountUsername: string
  accountPassword: string
  accountEmail: string
  accountEmailPassword: string
  accountEmailSiteUrl: string
  paidAt: Date
}

type AligoTemplateView = {
  senderKey: string | null
  templateCode: string | null
  templateName: string | null
  templateContent: string | null
  status: string | null
  inspectStatus: string | null
}

export type AlimtalkSettingsView = {
  enabled: boolean
  runtime: {
    apiKeyConfigured: boolean
    userId: string | null
    senderKey: string | null
    templateCode: string | null
    sender: string | null
    providerConnected: boolean
    providerMessage: string
    activeTemplate: AligoTemplateView | null
    templates: AligoTemplateView[]
  }
}

export type AlimtalkTestResult = {
  recipient: string
  providerMessageId: string | null
  providerMessage: string
}

type AligoSendResponse = {
  code?: number | string
  message?: string
  msg_id?: string
  mid?: string
}

type EnvConfig = {
  apiKey: string
  userId: string
  senderKey: string
  templateCode: string
  sender: string
}

const aligoTemplateListResponseSchema = z.object({
  code: z.union([z.number(), z.string()]).optional(),
  message: z.string().optional(),
  list: z
    .array(
      z.object({
        senderKey: z.string().optional(),
        templtCode: z.string().optional(),
        templtName: z.string().optional(),
        templtContent: z.string().optional(),
        status: z.string().optional(),
        inspStatus: z.string().optional(),
      }),
    )
    .optional(),
})

const aligoSendResponseSchema = z.object({
  code: z.union([z.number(), z.string()]).optional(),
  message: z.string().optional(),
  msg_id: z.string().optional(),
  mid: z.string().optional(),
})

const DEFAULT_ALIMTALK_TEMPLATE = `[{productName}]

구매일시: {purchaseDate}
상품명: {productName}

[스팀 계정 정보]
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
  return Object.entries(vars).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, value).replaceAll(`#{${key}}`, value)
  }, template)
}

function getEnvConfig(): EnvConfig {
  return {
    apiKey: process.env['ALIGO_API_KEY'] ?? '',
    userId: process.env['ALIGO_USER_ID'] ?? '',
    senderKey: process.env['ALIGO_SENDER_KEY'] ?? '',
    templateCode: process.env['ALIGO_TEMPLATE_CODE'] ?? '',
    sender: process.env['ALIGO_SENDER'] ?? '',
  }
}

function isConfigured(config: EnvConfig): boolean {
  return Boolean(
    config.apiKey && config.userId && config.senderKey && config.templateCode && config.sender,
  )
}

async function callAligo(
  path: string,
  params: Record<string, string>,
): Promise<Record<string, unknown>> {
  const res = await fetch(`https://kakaoapi.aligo.in${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams(params),
  })

  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>
  if (!res.ok) {
    throw new Error(`알리고 API 호출 실패 (${res.status}): ${JSON.stringify(json)}`)
  }

  return json
}

function mapTemplate(
  template:
    | {
        senderKey?: string
        templtCode?: string
        templtName?: string
        templtContent?: string
        status?: string
        inspStatus?: string
      }
    | null
    | undefined,
): AligoTemplateView | null {
  if (!template) {
    return null
  }

  return {
    senderKey: template.senderKey ?? null,
    templateCode: template.templtCode ?? null,
    templateName: template.templtName ?? null,
    templateContent: template.templtContent ?? null,
    status: template.status ?? null,
    inspectStatus: template.inspStatus ?? null,
  }
}

async function fetchTemplateInfo(config: EnvConfig): Promise<{
  providerConnected: boolean
  providerMessage: string
  activeTemplate: AligoTemplateView | null
  templates: AligoTemplateView[]
}> {
  if (!isConfigured(config)) {
    return {
      providerConnected: false,
      providerMessage: '알리고 환경변수가 모두 설정되지 않았습니다.',
      activeTemplate: null,
      templates: [],
    }
  }

  try {
    const json = await callAligo('/akv10/template/list/', {
      apikey: config.apiKey,
      userid: config.userId,
      senderkey: config.senderKey,
    })
    const parsed = aligoTemplateListResponseSchema.parse(json)
    const templates = (parsed.list ?? []).map((template) => mapTemplate(template)).filter(
      (template): template is AligoTemplateView => template !== null,
    )
    const activeTemplate =
      templates.find((template) => template.templateCode === config.templateCode) ?? null
    const providerConnected = String(parsed.code ?? '') === '0'

    return {
      providerConnected,
      providerMessage: parsed.message ?? (providerConnected ? '정상 연결' : '알리고 응답 확인 필요'),
      activeTemplate,
      templates,
    }
  } catch (error) {
    return {
      providerConnected: false,
      providerMessage: error instanceof Error ? error.message : String(error),
      activeTemplate: null,
      templates: [],
    }
  }
}

async function getMessageTemplate(config: EnvConfig): Promise<string> {
  const provider = await fetchTemplateInfo(config)
  return provider.activeTemplate?.templateContent ?? DEFAULT_ALIMTALK_TEMPLATE
}

async function sendAlimtalkMessage(input: {
  recipientPhoneNumber: string
  recipientName: string | null
  subject: string
  message: string
}): Promise<AligoSendResponse> {
  const config = getEnvConfig()
  if (!isConfigured(config)) {
    throw new Error('알리고 환경변수가 모두 설정되지 않았습니다.')
  }

  const json = aligoSendResponseSchema.parse(
    await callAligo('/akv10/alimtalk/send/', {
      apikey: config.apiKey,
      userid: config.userId,
      senderkey: config.senderKey,
      tpl_code: config.templateCode,
      sender: config.sender,
      receiver_1: input.recipientPhoneNumber,
      recvname_1: input.recipientName ?? '',
      subject_1: input.subject,
      message_1: input.message,
    }),
  )

  if (String(json.code ?? '') !== '0') {
    throw new Error(json.message ?? '알리고 알림톡 전송 실패')
  }

  return json
}

export async function getAlimtalkSettings(): Promise<AlimtalkSettingsView> {
  const settings = await getAlimtalkSettingsRecord()
  const config = getEnvConfig()
  const provider = await fetchTemplateInfo(config)

  return {
    enabled: settings?.enabled ?? true,
    runtime: {
      apiKeyConfigured: Boolean(config.apiKey),
      userId: config.userId || null,
      senderKey: config.senderKey || null,
      templateCode: config.templateCode || null,
      sender: config.sender || null,
      providerConnected: provider.providerConnected,
      providerMessage: provider.providerMessage,
      activeTemplate: provider.activeTemplate,
      templates: provider.templates,
    },
  }
}

export async function updateAlimtalkSettings(input: {
  enabled: boolean
}): Promise<AlimtalkSettingsView> {
  const existing = await getAlimtalkSettingsRecord()
  await upsertAlimtalkSettings(input.enabled, existing?.messageTemplate ?? DEFAULT_ALIMTALK_TEMPLATE)
  return getAlimtalkSettings()
}

export async function isAlimtalkEnabled(): Promise<boolean> {
  const settings = await getAlimtalkSettingsRecord()
  return settings?.enabled ?? true
}

export async function sendOrderAlimtalk(input: SendOrderAlimtalkInput): Promise<void> {
  const config = getEnvConfig()
  if (!isConfigured(config)) {
    throw new Error('알리고 환경변수가 모두 설정되지 않았습니다.')
  }

  const messageTemplate = await getMessageTemplate(config)
  const vars: Record<string, string> = {
    purchaseDate: formatDate(input.paidAt),
    productName: input.productName,
    accountUsername: input.accountUsername,
    accountPassword: input.accountPassword,
    accountEmail: input.accountEmail,
    accountEmailPassword: input.accountEmailPassword,
    accountEmailSiteUrl: input.accountEmailSiteUrl,
  }
  const message = applyTemplate(messageTemplate, vars)
  const deliveryLog = await createDeliveryLog({
    orderItemId: input.orderItemId,
    channel: 'alimtalk',
    recipient: input.recipientPhoneNumber,
  })

  try {
    const json = await sendAlimtalkMessage({
      recipientPhoneNumber: input.recipientPhoneNumber,
      recipientName: input.recipientName,
      subject: input.productName,
      message,
    })

    await updateDeliveryLog(deliveryLog.id, {
      status: 'sent',
      providerMessageId:
        typeof json.msg_id === 'string'
          ? json.msg_id
          : typeof json.mid === 'string'
            ? json.mid
            : null,
      sentAt: new Date(),
      errorMessage: null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await updateDeliveryLog(deliveryLog.id, {
      status: 'failed',
      errorMessage: message,
    })
    throw error
  }
}

export async function sendAlimtalkTest(): Promise<AlimtalkTestResult> {
  const config = getEnvConfig()
  if (!isConfigured(config)) {
    throw new Error('알리고 환경변수가 모두 설정되지 않았습니다.')
  }

  const messageTemplate = await getMessageTemplate(config)
  const message = applyTemplate(messageTemplate, {
    purchaseDate: formatDate(new Date()),
    productName: '알림톡 연동 점검',
    accountUsername: 'steam_test_user',
    accountPassword: 'steam_test_password',
    accountEmail: 'test@example.com',
    accountEmailPassword: 'email_test_password',
    accountEmailSiteUrl: 'https://example.com/mail',
  })

  const json = await sendAlimtalkMessage({
    recipientPhoneNumber: config.sender,
    recipientName: '스트림포켓 관리자',
    subject: '알림톡 연동 점검',
    message,
  })

  return {
    recipient: config.sender,
    providerMessageId:
      typeof json.msg_id === 'string'
        ? json.msg_id
        : typeof json.mid === 'string'
          ? json.mid
          : null,
    providerMessage: json.message ?? '전송 요청 완료',
  }
}
