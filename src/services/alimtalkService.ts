import { z } from 'zod'
import {
  getAlimtalkSettings as getAlimtalkSettingsRecord,
  upsertAlimtalkSettings,
} from '../repositories/alimtalkSettingsRepository'
import { createDeliveryLog, updateDeliveryLog } from '../repositories/deliveryLogRepository'

type SendOrderAlimtalkInput =
  | {
      productType: 'NA'
      orderItemId: string
      recipientPhoneNumber: string
      recipientName: string | null
      productName: string
      paidAt: Date
      accountUsername: string
      accountPassword: string
      accountEmail: string
      accountEmailPassword: string
      accountEmailSiteUrl: string
      accountSecondaryEmail: string | null
      accountSecondaryEmailPassword: string | null
      accountSecondaryEmailSiteUrl: string | null
    }
  | {
      productType: 'AA'
      orderItemId: string
      recipientPhoneNumber: string
      recipientName: string | null
      productName: string
      paidAt: Date
    }

type AligoTemplateView = {
  senderKey: string | null
  templateCode: string | null
  templateName: string | null
  templateContent: string | null
  status: string | null
  inspectStatus: string | null
  buttons: AligoTemplateButtonView[]
}

type AligoTemplateButtonView = {
  ordering: string | null
  name: string | null
  linkType: string | null
  linkTypeName: string | null
  linkMo: string | null
  linkPc: string | null
  linkIos: string | null
  linkAnd: string | null
}

export type AlimtalkSettingsView = {
  enabled: boolean
  runtime: {
    apiKeyConfigured: boolean
    userId: string | null
    senderKey: string | null
    templateCodeNA: string | null
    templateCodeAA: string | null
    templateCodeNASecondary: string | null
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
  info?: {
    mid?: number | string
  }
}

type EnvConfig = {
  apiKey: string
  userId: string
  senderKey: string
  templateCodeNA: string
  templateCodeAA: string
  templateCodeNASecondary: string
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
        buttons: z
          .array(
            z.object({
              ordering: z.string().optional(),
              name: z.string().optional(),
              linkType: z.string().optional(),
              linkTypeName: z.string().optional(),
              linkMo: z.string().optional(),
              linkPc: z.string().optional(),
              linkIos: z.string().optional(),
              linkAnd: z.string().optional(),
            }),
          )
          .optional(),
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

const ALIMTALK_MESSAGE_TEMPLATE = `#{서비스명} 구매가 완료되었습니다.
회원님의 계정 정보는 아래와 같습니다.

- 아이디: #{아이디}
- 임시 비밀번호: #{임시비밀번호}
- 이메일: #{이메일}
- 이메일 비밀번호: #{이메일비밀번호}
- 이메일 플랫폼: #{이메일플렛폼}

!주의사항!
- 보안을 위해 로그인 후 비밀번호를 변경해 주세요.`

export function applyTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((result, [key, value]) => {
    return result.replaceAll(`#{${key}}`, value).replaceAll(`{${key}}`, value)
  }, template)
}

function normalizeTemplateVariable(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, ' ').trim()
}

function normalizeMessageBody(message: string): string {
  return message
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\t/g, ' ').replace(/ {2,}/g, ' ').trimEnd())
    .join('\n')
}

function normalizeTemplateVars(vars: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(vars).map(([key, value]) => [key, normalizeTemplateVariable(value)]),
  )
}

export function getEnvConfig(): EnvConfig {
  return {
    apiKey: process.env['ALIGO_API_KEY'] ?? '',
    userId: process.env['ALIGO_USER_ID'] ?? '',
    senderKey: process.env['ALIGO_SENDER_KEY'] ?? '',
    templateCodeNA: process.env['ALIGO_TEMPLATE_CODE_NA'] ?? '',
    templateCodeAA: process.env['ALIGO_TEMPLATE_CODE_AA'] ?? '',
    templateCodeNASecondary: process.env['ALIGO_TEMPLATE_CODE_NA_SECONDARY'] ?? '',
    sender: process.env['ALIGO_SENDER'] ?? '',
  }
}

function isConfigured(config: EnvConfig): boolean {
  return Boolean(
    config.apiKey &&
      config.userId &&
      config.senderKey &&
      config.templateCodeNA &&
      config.templateCodeAA &&
      config.sender,
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

  const jsonValue: unknown = await res.json().catch(() => ({}))
  const json =
    typeof jsonValue === 'object' && jsonValue !== null
      ? (jsonValue as Record<string, unknown>) // 단언 사유: 런타임에서 object/null 여부를 선검증함
      : {}
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
        buttons?: Array<{
          ordering?: string
          name?: string
          linkType?: string
          linkTypeName?: string
          linkMo?: string
          linkPc?: string
          linkIos?: string
          linkAnd?: string
        }>
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
    buttons: (template.buttons ?? []).map((button) => ({
      ordering: button.ordering ?? null,
      name: button.name ?? null,
      linkType: button.linkType ?? null,
      linkTypeName: button.linkTypeName ?? null,
      linkMo: button.linkMo ?? null,
      linkPc: button.linkPc ?? null,
      linkIos: button.linkIos ?? null,
      linkAnd: button.linkAnd ?? null,
    })),
  }
}

async function fetchTemplateInfo(
  config: EnvConfig,
  templateCode: string,
): Promise<{
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
    const activeTemplate = templates.find((template) => template.templateCode === templateCode) ?? null
    const providerConnected = String(parsed.code ?? '') === '0'
    const providerMessage = parsed.message ?? (providerConnected ? '정상 연결' : '알리고 응답 확인 필요')
    const providerSummary = activeTemplate
      ? `${providerMessage} (tpl_code=${templateCode}, template=${activeTemplate.templateName ?? '-'}, inspectStatus=${activeTemplate.inspectStatus ?? '-'}, buttons=${activeTemplate.buttons.length})`
      : `${providerMessage} (tpl_code=${templateCode}, active template not found)`

    return {
      providerConnected,
      providerMessage: providerSummary,
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

function buildButtonPayload(template: AligoTemplateView): string | null {
  if (template.buttons.length === 0) {
    return null
  }

  return JSON.stringify({
    button: template.buttons.map((button) => ({
      name: button.name ?? '',
      linkType: button.linkType ?? '',
      ...(button.linkMo ? { linkMo: button.linkMo } : {}),
      ...(button.linkPc ? { linkPc: button.linkPc } : {}),
      ...(button.linkIos ? { linkIos: button.linkIos } : {}),
      ...(button.linkAnd ? { linkAnd: button.linkAnd } : {}),
    })),
  })
}

export async function getActiveTemplateOrThrow(
  config: EnvConfig,
  templateCode: string,
): Promise<AligoTemplateView> {
  const provider = await fetchTemplateInfo(config, templateCode)
  if (!provider.providerConnected) {
    throw new Error(`알리고 템플릿 조회 실패: ${provider.providerMessage}`)
  }

  if (!provider.activeTemplate?.templateContent) {
    throw new Error(`템플릿 코드 불일치: ${templateCode}에 해당하는 승인 템플릿을 찾지 못했습니다.`)
  }

  if (provider.activeTemplate.inspectStatus !== 'APR') {
    throw new Error(
      `승인되지 않은 템플릿입니다: tpl_code=${templateCode}, inspectStatus=${provider.activeTemplate.inspectStatus ?? 'unknown'}`,
    )
  }

  console.info('[ALIMTALK] template ready', {
    templateCode,
    templateName: provider.activeTemplate.templateName,
    inspectStatus: provider.activeTemplate.inspectStatus,
    messageLength: provider.activeTemplate.templateContent.length,
    buttonCount: provider.activeTemplate.buttons.length,
  })

  return provider.activeTemplate
}

export async function sendAlimtalkMessage(input: {
  templateCode: string
  recipientPhoneNumber: string
  recipientName: string | null
  subject?: string
  message: string
  buttonJson?: string | null
}): Promise<AligoSendResponse> {
  const config = getEnvConfig()
  if (!isConfigured(config)) {
    throw new Error('알리고 환경변수가 모두 설정되지 않았습니다.')
  }

  const params: Record<string, string> = {
    apikey: config.apiKey,
    userid: config.userId,
    senderkey: config.senderKey,
    tpl_code: input.templateCode,
    sender: config.sender,
    receiver_1: input.recipientPhoneNumber,
    recvname_1: normalizeTemplateVariable(input.recipientName ?? ''),
    message_1: normalizeMessageBody(input.message),
  }
  if (input.subject) {
    params['subject_1'] = input.subject
  }
  if (input.buttonJson) {
    params['button_1'] = input.buttonJson
  }

  const json = aligoSendResponseSchema.parse(await callAligo('/akv10/alimtalk/send/', params))

  if (String(json.code ?? '') !== '0') {
    throw new Error(json.message ?? '알리고 알림톡 전송 실패')
  }

  return json
}

function getProviderMessageId(json: AligoSendResponse): string | null {
  if (typeof json.msg_id === 'string') {
    return json.msg_id
  }
  if (typeof json.info?.mid === 'number') {
    return String(json.info.mid)
  }
  if (typeof json.info?.mid === 'string') {
    return json.info.mid
  }
  if (typeof json.mid === 'string') {
    return json.mid
  }
  return null
}

export async function getAlimtalkSettings(): Promise<AlimtalkSettingsView> {
  const settings = await getAlimtalkSettingsRecord()
  const config = getEnvConfig()
  const provider = await fetchTemplateInfo(config, config.templateCodeNA)

  return {
    enabled: settings?.enabled ?? true,
    runtime: {
      apiKeyConfigured: Boolean(config.apiKey),
      userId: config.userId || null,
      senderKey: config.senderKey || null,
      templateCodeNA: config.templateCodeNA || null,
      templateCodeAA: config.templateCodeAA || null,
      templateCodeNASecondary: config.templateCodeNASecondary || null,
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
  await upsertAlimtalkSettings(input.enabled, existing?.messageTemplate ?? ALIMTALK_MESSAGE_TEMPLATE)
  return getAlimtalkSettings()
}

export async function isAlimtalkEnabled(): Promise<boolean> {
  const settings = await getAlimtalkSettingsRecord()
  return settings?.enabled ?? true
}

export async function sendOrderAlimtalk(
  input: SendOrderAlimtalkInput,
): Promise<void> {
  const config = getEnvConfig()
  if (!isConfigured(config)) {
    throw new Error('알리고 환경변수가 모두 설정되지 않았습니다.')
  }

  const hasSecondaryEmail = input.productType === 'NA' && Boolean(input.accountSecondaryEmail)

  if (hasSecondaryEmail && !config.templateCodeNASecondary) {
    throw new Error('2차 이메일 알림톡 템플릿 코드(ALIGO_TEMPLATE_CODE_NA_SECONDARY)가 설정되지 않았습니다.')
  }

  const templateCode =
    input.productType === 'NA'
      ? (hasSecondaryEmail ? config.templateCodeNASecondary : config.templateCodeNA)
      : config.templateCodeAA
  const template = await getActiveTemplateOrThrow(config, templateCode)
  const buttonJson = buildButtonPayload(template)
  const deliveryLog = await createDeliveryLog({
    orderItemId: input.orderItemId,
    channel: 'alimtalk',
    recipient: input.recipientPhoneNumber,
  })

  try {
    const templateContent = template.templateContent ?? ALIMTALK_MESSAGE_TEMPLATE
    const vars: Record<string, string> =
      input.productType === 'NA'
        ? {
            서비스명: input.productName,
            아이디: input.accountUsername,
            임시비밀번호: input.accountPassword,
            이메일: input.accountEmail,
            이메일비밀번호: input.accountEmailPassword,
            이메일플렛폼: input.accountEmailSiteUrl,
            ...(input.accountSecondaryEmail
              ? {
                  '2차이메일': input.accountSecondaryEmail,
                  '2차이메일비밀번호': input.accountSecondaryEmailPassword ?? '',
                  '2차이메일플렛폼': input.accountSecondaryEmailSiteUrl ?? '',
                }
              : {}),
          }
        : {
            상품명: input.productName,
          }

    const json = await sendAlimtalkMessage({
      templateCode,
      recipientPhoneNumber: input.recipientPhoneNumber,
      recipientName: input.recipientName,
      message: applyTemplate(templateContent, normalizeTemplateVars(vars)),
      buttonJson,
    })

    await updateDeliveryLog(deliveryLog.id, {
      status: 'sent',
      providerMessageId: getProviderMessageId(json),
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

  const template = await getActiveTemplateOrThrow(config, config.templateCodeNA)
  const buttonJson = buildButtonPayload(template)
  const templateContent = template.templateContent ?? ALIMTALK_MESSAGE_TEMPLATE
  const message = applyTemplate(templateContent, {
    서비스명: '알림톡 연동 점검',
    아이디: 'test_user',
    임시비밀번호: 'test_password',
    이메일: 'test@example.com',
    이메일비밀번호: 'email_password',
    이메일플렛폼: 'https://example.com/mail',
  })

  const json = await sendAlimtalkMessage({
    templateCode: config.templateCodeNA,
    recipientPhoneNumber: config.sender,
    recipientName: '스트림포켓 관리자',
    message,
    buttonJson,
  })

  return {
    recipient: config.sender,
    providerMessageId: getProviderMessageId(json),
    providerMessage: json.message ?? '전송 요청 완료',
  }
}
