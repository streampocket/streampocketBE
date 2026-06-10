import { z } from 'zod'
import { Store } from '@prisma/client'
import { DEFAULT_STORE } from '../constants/stores'
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
  | {
      productType: 'BG'
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
    templateCodeNAOutOfStock: string | null
    templateCodeReviewGame: string | null
    templateCodeBG: string | null
    templateCodePartyApply: string | null
    templateCodeOrderStatus: string | null
    templateCodeOrderCompleted: string | null
    templateCodePhoneVerify: string | null
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

type SendReviewGameAlimtalkInput = {
  orderItemId: string
  recipientPhoneNumber: string
  recipientName: string | null
  productName: string
  codes: Array<{ gameName: string | null; code: string }>
}

type EnvConfig = {
  apiKey: string
  userId: string
  senderKey: string
  templateCodeNA: string
  templateCodeAA: string
  templateCodeNASecondary: string
  templateCodeNAOutOfStock: string
  templateCodeReviewGame: string
  templateCodeBG: string
  templateCodePartyApply: string
  templateCodeOrderStatus: string
  templateCodeOrderCompleted: string
  templateCodePhoneVerify: string
  sender: string
}

export type AlimtalkSendResult =
  | { ok: true; providerMessageId: string | null }
  | { ok: false; reason: string }

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

// 스토어별 ALIGO 환경변수 접미사 — streampocket: 기존 키, pokemon_steam: _POKEMON 접미사.
// 폴백 없음(포켓 미설정 시 isConfigured 실패 → manual_review). 교차 발신 방지.
const STORE_ALIGO_SUFFIX: Record<Store, string> = {
  streampocket: '',
  pokemon_steam: '_POKEMON',
}

function aligoEnv(key: string, store: Store): string {
  return process.env[`${key}${STORE_ALIGO_SUFFIX[store]}`] ?? ''
}

// store=null(수동주문 등 스토어 무귀속)이면 기본 스토어(streampocket) 알리고 설정 사용.
export function getEnvConfig(store: Store | null = DEFAULT_STORE): EnvConfig {
  const resolved = store ?? DEFAULT_STORE
  return {
    apiKey: aligoEnv('ALIGO_API_KEY', resolved),
    userId: aligoEnv('ALIGO_USER_ID', resolved),
    senderKey: aligoEnv('ALIGO_SENDER_KEY', resolved),
    templateCodeNA: aligoEnv('ALIGO_TEMPLATE_CODE_NA', resolved),
    templateCodeAA: aligoEnv('ALIGO_TEMPLATE_CODE_AA', resolved),
    templateCodeNASecondary: aligoEnv('ALIGO_TEMPLATE_CODE_NA_SECONDARY', resolved),
    templateCodeNAOutOfStock: aligoEnv('ALIGO_TEMPLATE_CODE_NA_OUT_OF_STOCK', resolved),
    templateCodeReviewGame: aligoEnv('ALIGO_TEMPLATE_CODE_REVIEW_GAME', resolved),
    templateCodeBG: aligoEnv('ALIGO_TEMPLATE_CODE_BG', resolved),
    templateCodePartyApply: aligoEnv('ALIGO_TEMPLATE_CODE_PARTY_APPLY', resolved),
    templateCodeOrderStatus: aligoEnv('ALIGO_TEMPLATE_CODE_ORDER_STATUS', resolved),
    templateCodeOrderCompleted: aligoEnv('ALIGO_TEMPLATE_CODE_ORDER_COMPLETED', resolved),
    templateCodePhoneVerify: aligoEnv('ALIGO_TEMPLATE_CODE_PHONE_VERIFY', resolved),
    sender: aligoEnv('ALIGO_SENDER', resolved),
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

export async function sendAlimtalkMessage(
  input: {
    templateCode: string
    recipientPhoneNumber: string
    recipientName: string | null
    subject?: string
    message: string
    buttonJson?: string | null
  },
  // store별 알리고 발신 계정(apikey/senderkey/sender)으로 발송 — 미지정 시 기본 스토어(streampocket)
  store: Store | null = DEFAULT_STORE,
): Promise<AligoSendResponse> {
  const config = getEnvConfig(store)
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
      templateCodeNAOutOfStock: config.templateCodeNAOutOfStock || null,
      templateCodeReviewGame: config.templateCodeReviewGame || null,
      templateCodeBG: config.templateCodeBG || null,
      templateCodePartyApply: config.templateCodePartyApply || null,
      templateCodeOrderStatus: config.templateCodeOrderStatus || null,
      templateCodeOrderCompleted: config.templateCodeOrderCompleted || null,
      templateCodePhoneVerify: config.templateCodePhoneVerify || null,
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
  store: Store | null = DEFAULT_STORE,
): Promise<void> {
  const config = getEnvConfig(store)
  if (!isConfigured(config)) {
    throw new Error('알리고 환경변수가 모두 설정되지 않았습니다.')
  }

  const hasSecondaryEmail = input.productType === 'NA' && Boolean(input.accountSecondaryEmail)

  if (hasSecondaryEmail && !config.templateCodeNASecondary) {
    throw new Error('2차 이메일 알림톡 템플릿 코드(ALIGO_TEMPLATE_CODE_NA_SECONDARY)가 설정되지 않았습니다.')
  }

  if (input.productType === 'BG' && !config.templateCodeBG) {
    throw new Error('배틀그라운드 알림톡 템플릿 코드(ALIGO_TEMPLATE_CODE_BG)가 설정되지 않았습니다.')
  }

  const templateCode =
    input.productType === 'NA'
      ? (hasSecondaryEmail ? config.templateCodeNASecondary : config.templateCodeNA)
      : input.productType === 'BG'
        ? config.templateCodeBG
        : config.templateCodeAA
  const template = await getActiveTemplateOrThrow(config, templateCode)
  const buttonJson = buildButtonPayload(template)
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
          // 2차 이메일 변수는 항상 포함(없으면 빈값). 2차 변수를 가진 단일 템플릿(예: 포켓 UI_4989)에
          // 2차 없는 계정을 보낼 때 #{2차이메일} 리터럴이 남아 발송 거부되는 것을 방지.
          // 2차 자리가 없는 템플릿(예: 스트림 UG_5955)은 빈값 치환이 매칭 없이 무시되어 무영향.
          '2차이메일': input.accountSecondaryEmail ?? '',
          '2차이메일비밀번호': input.accountSecondaryEmailPassword ?? '',
          '2차이메일플렛폼': input.accountSecondaryEmailSiteUrl ?? '',
        }
      : {
          상품명: input.productName,
        }
  const message = applyTemplate(templateContent, normalizeTemplateVars(vars))

  const deliveryLog = await createDeliveryLog({
    orderItemId: input.orderItemId,
    channel: 'alimtalk',
    recipient: input.recipientPhoneNumber,
    templateCode,
    message,
  })

  try {
    const json = await sendAlimtalkMessage(
      {
        templateCode,
        recipientPhoneNumber: input.recipientPhoneNumber,
        recipientName: input.recipientName,
        message,
        buttonJson,
      },
      store,
    )

    await updateDeliveryLog(deliveryLog.id, {
      status: 'sent',
      providerMessageId: getProviderMessageId(json),
      sentAt: new Date(),
      errorMessage: null,
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    await updateDeliveryLog(deliveryLog.id, {
      status: 'failed',
      errorMessage: reason,
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

// store별 알리고 설정 사용 — 주문이 들어온 스토어 발신프로필로 발송(교차 발신 방지)
export async function sendReviewGameAlimtalk(
  input: SendReviewGameAlimtalkInput,
  store: Store | null = DEFAULT_STORE,
): Promise<void> {
  const config = getEnvConfig(store)
  if (!isConfigured(config)) {
    throw new Error('알리고 환경변수가 모두 설정되지 않았습니다.')
  }

  if (!config.templateCodeReviewGame) {
    throw new Error('리뷰게임 알림톡 템플릿 코드(ALIGO_TEMPLATE_CODE_REVIEW_GAME)가 설정되지 않았습니다.')
  }

  const template = await getActiveTemplateOrThrow(config, config.templateCodeReviewGame)
  const buttonJson = buildButtonPayload(template)

  const codeList = input.codes
    .map((c, i) => `${i + 1}. ${c.gameName ? `[${c.gameName}] ` : ''}${c.code}`)
    .join('\n')

  const templateContent = template.templateContent ?? ''
  const vars: Record<string, string> = {
    리뷰상품: codeList,
  }
  const message = applyTemplate(templateContent, normalizeTemplateVars(vars))

  const deliveryLog = await createDeliveryLog({
    orderItemId: input.orderItemId,
    channel: 'alimtalk',
    recipient: input.recipientPhoneNumber,
    templateCode: config.templateCodeReviewGame,
    message,
  })

  try {
    const json = await sendAlimtalkMessage(
      {
        templateCode: config.templateCodeReviewGame,
        recipientPhoneNumber: input.recipientPhoneNumber,
        recipientName: input.recipientName,
        message,
        buttonJson,
      },
      store,
    )

    await updateDeliveryLog(deliveryLog.id, {
      status: 'sent',
      providerMessageId: getProviderMessageId(json),
      sentAt: new Date(),
      errorMessage: null,
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    await updateDeliveryLog(deliveryLog.id, {
      status: 'failed',
      errorMessage: reason,
    })
    throw error
  }
}

type SendPartyApplicationAlimtalkInput = {
  partyApplicationId: string
  recipientPhoneNumber: string
  recipientName: string
  productName: string
}

export async function sendPartyApplicationAlimtalk(
  input: SendPartyApplicationAlimtalkInput,
): Promise<AlimtalkSendResult> {
  const config = getEnvConfig()
  if (!isConfigured(config)) {
    return { ok: false, reason: '알리고 환경변수 미설정' }
  }
  if (!config.templateCodePartyApply) {
    return { ok: false, reason: '템플릿 코드 미설정 (ALIGO_TEMPLATE_CODE_PARTY_APPLY)' }
  }

  let template: AligoTemplateView
  try {
    template = await getActiveTemplateOrThrow(config, config.templateCodePartyApply)
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    return { ok: false, reason }
  }

  const buttonJson = buildButtonPayload(template)
  const templateContent = template.templateContent ?? ''
  const vars: Record<string, string> = {
    성함: input.recipientName,
    상품명: input.productName,
  }
  const message = applyTemplate(templateContent, normalizeTemplateVars(vars))

  const deliveryLog = await createDeliveryLog({
    partyApplicationId: input.partyApplicationId,
    channel: 'alimtalk',
    recipient: input.recipientPhoneNumber,
    templateCode: config.templateCodePartyApply,
    message,
  })

  try {
    const json = await sendAlimtalkMessage({
      templateCode: config.templateCodePartyApply,
      recipientPhoneNumber: input.recipientPhoneNumber,
      recipientName: input.recipientName,
      message,
      buttonJson,
    })

    const providerMessageId = getProviderMessageId(json)
    await updateDeliveryLog(deliveryLog.id, {
      status: 'sent',
      providerMessageId,
      sentAt: new Date(),
      errorMessage: null,
    })
    return { ok: true, providerMessageId }
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    await updateDeliveryLog(deliveryLog.id, {
      status: 'failed',
      errorMessage: reason,
    })
    return { ok: false, reason }
  }
}

type SendOutOfStockAlimtalkInput = {
  orderItemId: string
  recipientPhoneNumber: string
  recipientName: string | null
}

export async function sendOutOfStockAlimtalk(
  input: SendOutOfStockAlimtalkInput,
  store: Store | null = DEFAULT_STORE,
): Promise<void> {
  const config = getEnvConfig(store)
  if (!isConfigured(config)) {
    throw new Error('알리고 환경변수가 모두 설정되지 않았습니다.')
  }

  if (!config.templateCodeNAOutOfStock) {
    throw new Error(
      'NA 재고없음 안내 알림톡 템플릿 코드(ALIGO_TEMPLATE_CODE_NA_OUT_OF_STOCK)가 설정되지 않았습니다.',
    )
  }

  const template = await getActiveTemplateOrThrow(config, config.templateCodeNAOutOfStock)
  const buttonJson = buildButtonPayload(template)
  const templateContent = template.templateContent ?? ''

  const deliveryLog = await createDeliveryLog({
    orderItemId: input.orderItemId,
    channel: 'alimtalk',
    recipient: input.recipientPhoneNumber,
    templateCode: config.templateCodeNAOutOfStock,
    message: templateContent,
  })

  try {
    const json = await sendAlimtalkMessage(
      {
        templateCode: config.templateCodeNAOutOfStock,
        recipientPhoneNumber: input.recipientPhoneNumber,
        recipientName: input.recipientName,
        message: templateContent,
        buttonJson,
      },
      store,
    )

    await updateDeliveryLog(deliveryLog.id, {
      status: 'sent',
      providerMessageId: getProviderMessageId(json),
      sentAt: new Date(),
      errorMessage: null,
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    await updateDeliveryLog(deliveryLog.id, {
      status: 'failed',
      errorMessage: reason,
    })
    throw error
  }
}

type SendOrderStatusAlimtalkInput = {
  orderItemId: string
  recipientPhoneNumber: string
  recipientName: string | null
  productOrderId: string
}

// 주문 진행상황 조회 안내 알림톡 (관리자가 주문 상세 모달에서 수동 발송)
// store별 알리고 설정 사용 — 주문이 들어온 스토어 발신프로필로 발송(교차 발신 방지)
export async function sendOrderStatusAlimtalk(
  input: SendOrderStatusAlimtalkInput,
  store: Store | null = DEFAULT_STORE,
): Promise<void> {
  const config = getEnvConfig(store)
  if (!isConfigured(config)) {
    throw new Error('알리고 환경변수가 모두 설정되지 않았습니다.')
  }

  if (!config.templateCodeOrderStatus) {
    throw new Error(
      '주문상황 알림톡 템플릿 코드(ALIGO_TEMPLATE_CODE_ORDER_STATUS)가 설정되지 않았습니다.',
    )
  }

  const template = await getActiveTemplateOrThrow(config, config.templateCodeOrderStatus)
  const buttonJson = buildButtonPayload(template)
  const templateContent = template.templateContent ?? ''
  const vars: Record<string, string> = {
    고객명: input.recipientName ?? '고객',
    // Aligo 템플릿 UH_9631의 #{네이버주문번호} placeholder에 매핑 — 실제 값은 상품주문번호(track 조회 기준)
    네이버주문번호: input.productOrderId,
  }
  const message = applyTemplate(templateContent, normalizeTemplateVars(vars))

  const deliveryLog = await createDeliveryLog({
    orderItemId: input.orderItemId,
    channel: 'alimtalk',
    recipient: input.recipientPhoneNumber,
    templateCode: config.templateCodeOrderStatus,
    message,
  })

  try {
    const json = await sendAlimtalkMessage(
      {
        templateCode: config.templateCodeOrderStatus,
        recipientPhoneNumber: input.recipientPhoneNumber,
        recipientName: input.recipientName,
        message,
        buttonJson,
      },
      store,
    )

    await updateDeliveryLog(deliveryLog.id, {
      status: 'sent',
      providerMessageId: getProviderMessageId(json),
      sentAt: new Date(),
      errorMessage: null,
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    await updateDeliveryLog(deliveryLog.id, {
      status: 'failed',
      errorMessage: reason,
    })
    throw error
  }
}

type SendOrderCompletedAlimtalkInput = {
  orderItemId: string
  recipientPhoneNumber: string
  recipientName: string | null
}

// 주문 완료 처리 시 게임선물 완료 안내 알림톡 (고정 메시지, 변수 없음)
// store별 알리고 설정 사용 — 주문이 들어온 스토어 발신프로필로 발송(교차 발신 방지)
export async function sendOrderCompletedAlimtalk(
  input: SendOrderCompletedAlimtalkInput,
  store: Store | null = DEFAULT_STORE,
): Promise<void> {
  const config = getEnvConfig(store)
  if (!isConfigured(config)) {
    throw new Error('알리고 환경변수가 모두 설정되지 않았습니다.')
  }

  if (!config.templateCodeOrderCompleted) {
    throw new Error(
      '주문 완료 알림톡 템플릿 코드(ALIGO_TEMPLATE_CODE_ORDER_COMPLETED)가 설정되지 않았습니다.',
    )
  }

  const template = await getActiveTemplateOrThrow(config, config.templateCodeOrderCompleted)
  const buttonJson = buildButtonPayload(template)
  const templateContent = template.templateContent ?? ''

  const deliveryLog = await createDeliveryLog({
    orderItemId: input.orderItemId,
    channel: 'alimtalk',
    recipient: input.recipientPhoneNumber,
    templateCode: config.templateCodeOrderCompleted,
    message: templateContent,
  })

  try {
    const json = await sendAlimtalkMessage(
      {
        templateCode: config.templateCodeOrderCompleted,
        recipientPhoneNumber: input.recipientPhoneNumber,
        recipientName: input.recipientName,
        message: templateContent,
        buttonJson,
      },
      store,
    )

    await updateDeliveryLog(deliveryLog.id, {
      status: 'sent',
      providerMessageId: getProviderMessageId(json),
      sentAt: new Date(),
      errorMessage: null,
    })
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error)
    await updateDeliveryLog(deliveryLog.id, {
      status: 'failed',
      errorMessage: reason,
    })
    throw error
  }
}
