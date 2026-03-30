import { z } from 'zod'
import {
  getAlimtalkSettings as getAlimtalkSettingsRecord,
  upsertAlimtalkSettings,
} from '../repositories/alimtalkSettingsRepository'
import { createDeliveryLog, updateDeliveryLog } from '../repositories/deliveryLogRepository'

// ─────────────────────────────────────────
// 타입 정의
// ─────────────────────────────────────────

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
  info?: {
    mid?: number | string
  }
}

type EnvConfig = {
  apiKey: string
  userId: string
  senderKey: string
  templateCode: string
  sender: string
}

// ─────────────────────────────────────────
// Zod 스키마
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// 템플릿 fallback 상수
// Aligo API에서 템플릿을 가져오지 못할 경우에만 사용 (UG_5955 내용과 동일)
// ─────────────────────────────────────────

const ALIMTALK_MESSAGE_TEMPLATE = `#{서비스명} 구매가 완료되었습니다.
회원님의 계정 정보는 아래와 같습니다.

- 아이디: #{아이디}
- 임시 비밀번호: #{임시비밀번호}
- 이메일: #{이메일}
- 이메일 비밀번호: #{이메일비밀번호}
- 이메일 플렛폼: #{이메일플렛폼}

!주의사항!
- 보안을 위해 로그인 후 비밀번호를 변경해 주세요.`

// ─────────────────────────────────────────
// 유틸 함수
// ─────────────────────────────────────────

// 템플릿 변수(#{key}) 치환
function applyTemplate(template: string, vars: Record<string, string>): string {
  return Object.entries(vars).reduce((result, [key, value]) => {
    return result.replaceAll(`#{${key}}`, value).replaceAll(`{${key}}`, value)
  }, template)
}

// 변수값 정규화: CRLF → LF, 탭 → 공백, 앞뒤 공백 제거
function normalizeTemplateVariable(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').replace(/\t/g, ' ').trim()
}

// 메시지 본문 정규화: CRLF → LF, 중복 공백 제거
function normalizeMessageBody(message: string): string {
  return message
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\t/g, ' ').replace(/ {2,}/g, ' ').trimEnd())
    .join('\n')
}

// 변수 맵 전체 정규화
function normalizeTemplateVars(vars: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(vars).map(([key, value]) => [key, normalizeTemplateVariable(value)]),
  )
}

// ─────────────────────────────────────────
// 환경변수 / 설정
// ─────────────────────────────────────────

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

// ─────────────────────────────────────────
// Aligo API 공통 호출 헬퍼
// ─────────────────────────────────────────

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

// Aligo 응답 템플릿 객체 → 내부 타입 변환
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

// 알리고 템플릿 목록 조회 및 활성 템플릿 확인
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
    const providerMessage = parsed.message ?? (providerConnected ? '정상 연결' : '알리고 응답 확인 필요')
    const providerSummary = activeTemplate
      ? `${providerMessage} (tpl_code=${config.templateCode}, template=${activeTemplate.templateName ?? '-'}, inspectStatus=${activeTemplate.inspectStatus ?? '-'}, buttons=${activeTemplate.buttons.length})`
      : `${providerMessage} (tpl_code=${config.templateCode}, active template not found)`

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

// 버튼 정보를 Aligo send API 파라미터 형식으로 직렬화
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

// 알리고에서 활성 승인 템플릿을 가져오거나 실패 시 예외 발생
async function getActiveTemplateOrThrow(config: EnvConfig): Promise<AligoTemplateView> {
  const provider = await fetchTemplateInfo(config)
  if (!provider.providerConnected) {
    throw new Error(`알리고 템플릿 조회 실패: ${provider.providerMessage}`)
  }

  if (!provider.activeTemplate?.templateContent) {
    throw new Error(`템플릿 코드 불일치: ${config.templateCode}에 해당하는 승인 템플릿을 찾지 못했습니다.`)
  }

  if (provider.activeTemplate.inspectStatus !== 'APR') {
    throw new Error(
      `승인되지 않은 템플릿입니다: tpl_code=${config.templateCode}, inspectStatus=${provider.activeTemplate.inspectStatus ?? 'unknown'}`,
    )
  }

  console.info('[ALIMTALK] template ready', {
    templateCode: config.templateCode,
    templateName: provider.activeTemplate.templateName,
    inspectStatus: provider.activeTemplate.inspectStatus,
    messageLength: provider.activeTemplate.templateContent.length,
    buttonCount: provider.activeTemplate.buttons.length,
  })

  return provider.activeTemplate
}

// 알리고 알림톡 단건 전송
async function sendAlimtalkMessage(input: {
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
    tpl_code: config.templateCode,
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

  const json = aligoSendResponseSchema.parse(
    await callAligo('/akv10/alimtalk/send/', params),
  )

  if (String(json.code ?? '') !== '0') {
    throw new Error(json.message ?? '알리고 알림톡 전송 실패')
  }

  return json
}

// ─────────────────────────────────────────
// 설정 조회 / 업데이트 (관리자 API)
// ─────────────────────────────────────────

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
  await upsertAlimtalkSettings(input.enabled, existing?.messageTemplate ?? ALIMTALK_MESSAGE_TEMPLATE)
  return getAlimtalkSettings()
}

export async function isAlimtalkEnabled(): Promise<boolean> {
  const settings = await getAlimtalkSettingsRecord()
  return settings?.enabled ?? true
}

// ─────────────────────────────────────────
// 실제 주문 알림톡 발송 (주문 처리 흐름에서 호출)
// ─────────────────────────────────────────

export async function sendOrderAlimtalk(input: SendOrderAlimtalkInput): Promise<void> {
  const config = getEnvConfig()
  if (!isConfigured(config)) {
    throw new Error('알리고 환경변수가 모두 설정되지 않았습니다.')
  }

  const template = await getActiveTemplateOrThrow(config)
  const buttonJson = buildButtonPayload(template)
  const deliveryLog = await createDeliveryLog({
    orderItemId: input.orderItemId,
    channel: 'alimtalk',
    recipient: input.recipientPhoneNumber,
  })

  try {
    const templateContent = template.templateContent ?? ALIMTALK_MESSAGE_TEMPLATE
    // 실제 주문 정보로 템플릿 변수 치환
    const vars: Record<string, string> = {
      서비스명: input.productName,
      아이디: input.accountUsername,
      임시비밀번호: input.accountPassword,
      이메일: input.accountEmail,
      이메일비밀번호: input.accountEmailPassword,
      이메일플렛폼: input.accountEmailSiteUrl,
    }
    const json = await sendAlimtalkMessage({
      recipientPhoneNumber: input.recipientPhoneNumber,
      recipientName: input.recipientName,
      message: applyTemplate(templateContent, normalizeTemplateVars(vars)),
      buttonJson,
    })

    await updateDeliveryLog(deliveryLog.id, {
      status: 'sent',
      providerMessageId:
        typeof json.msg_id === 'string'
          ? json.msg_id
          : typeof json.info?.mid === 'number'
            ? String(json.info.mid)
            : typeof json.info?.mid === 'string'
              ? json.info.mid
          : typeof json.mid === 'string'
            ? json.mid
            : null,
      sentAt: new Date(),
      errorMessage: null,
    })
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    await updateDeliveryLog(deliveryLog.id, {
      status: 'failed',
      errorMessage: msg,
    })
    throw error
  }
}

// ─────────────────────────────────────────
// 테스트 발송 (관리자 페이지에서 수동 실행)
// config.sender(발신번호)로 더미 데이터를 치환하여 발송
// ─────────────────────────────────────────

export async function sendAlimtalkTest(): Promise<AlimtalkTestResult> {
  const config = getEnvConfig()
  if (!isConfigured(config)) {
    throw new Error('알리고 환경변수가 모두 설정되지 않았습니다.')
  }

  const template = await getActiveTemplateOrThrow(config)
  const buttonJson = buildButtonPayload(template)
  const templateContent = template.templateContent ?? ALIMTALK_MESSAGE_TEMPLATE
  // 테스트용 더미 데이터로 변수 치환
  const message = applyTemplate(templateContent, {
    서비스명: '알림톡 연동 점검',
    아이디: 'test_user',
    임시비밀번호: 'test_password',
    이메일: 'test@example.com',
    이메일비밀번호: 'email_password',
    이메일플렛폼: 'https://example.com/mail',
  })

  const json = await sendAlimtalkMessage({
    recipientPhoneNumber: config.sender,
    recipientName: '스트림포켓 관리자',
    message,
    buttonJson,
  })

  return {
    recipient: config.sender,
    providerMessageId:
      typeof json.msg_id === 'string'
        ? json.msg_id
        : typeof json.info?.mid === 'number'
          ? String(json.info.mid)
          : typeof json.info?.mid === 'string'
            ? json.info.mid
        : typeof json.mid === 'string'
          ? json.mid
          : null,
    providerMessage: json.message ?? '전송 요청 완료',
  }
}
