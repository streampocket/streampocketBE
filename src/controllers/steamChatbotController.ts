import { Request, Response } from 'express'
import { z } from 'zod'
import { SteamOrderItem } from '@prisma/client'
import { FIELD_LABELS } from '../utils/steamRegistrationParser'
import { RegistrationWithOrder } from '../repositories/steamRegistrationRepository'
import { answerMissingField, submitRegistration } from '../services/steamRegistrationService'

// ───────────────────────── 카카오 i 오픈빌더 SkillResponse 타입 ─────────────────────────

type SkillButton = {
  action: 'webLink'
  label: string
  webLinkUrl: string
}

type SkillOutput =
  | { simpleText: { text: string } }
  | { textCard: { text: string; buttons: SkillButton[] } }

type SkillContextValue = {
  name: string
  lifeSpan: number
  params: Record<string, string>
}

type SkillResponse = {
  version: '2.0'
  template: { outputs: SkillOutput[] }
  context?: { values: SkillContextValue[] }
}

// 오픈빌더 스킬 요청 — 필요한 필드만 추출 (나머지는 무시)
const skillRequestSchema = z.object({
  userRequest: z.object({
    utterance: z.string(),
    user: z.object({ id: z.string() }),
  }),
})

// ───────────────────────── 응답 빌더 ─────────────────────────

function getFeOrigin(): string {
  return (process.env.FE_ORIGIN ?? 'http://localhost:3000').split(',')[0].trim()
}

function buildTrackUrl(productOrderId: string | null): string {
  const base = `${getFeOrigin()}/track`
  return productOrderId ? `${base}?productOrderId=${encodeURIComponent(productOrderId)}` : base
}

function simpleTextResponse(text: string): SkillResponse {
  return { version: '2.0', template: { outputs: [{ simpleText: { text } }] } }
}

function buildSkillResponse(
  registration: RegistrationWithOrder,
  missingFields: string[],
  matchedOrder: SteamOrderItem | null,
): SkillResponse {
  // 누락 항목이 있으면 첫 항목을 되묻고, 컨텍스트에 진행 정보를 싣는다.
  if (missingFields.length > 0) {
    const nextField = missingFields[0]
    const label = FIELD_LABELS[nextField] ?? nextField
    return {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: `접수 양식을 확인했어요. '${label}' 항목이 빠진 것 같아요.\n${label}을(를) 보내주시겠어요?`,
            },
          },
        ],
      },
      context: {
        values: [
          {
            name: 'steam_reg_missing',
            lifeSpan: 5,
            params: { registrationId: registration.id, missingField: nextField },
          },
        ],
      },
    }
  }

  // 접수 완료 — 확인 메시지 + 진행상황 조회 버튼
  const buyerName = registration.buyerName ?? '고객'
  const productOrderId = matchedOrder?.productOrderId ?? registration.orderItem?.productOrderId ?? null
  const text = productOrderId
    ? `✅ ${buyerName}님, 스팀 등록 양식이 정상 접수되었습니다.\n\n🔹 주문번호: ${productOrderId}\n\n아래 [실시간 진행상황 조회] 버튼으로 진행 상황을 확인하실 수 있어요. 감사합니다 😊`
    : `✅ ${buyerName}님, 스팀 등록 양식이 정상 접수되었습니다.\n\n아래 [실시간 진행상황 조회] 버튼을 눌러 상품주문번호를 입력하시면 진행 상황을 확인하실 수 있어요. 감사합니다 😊`

  return {
    version: '2.0',
    template: {
      outputs: [
        {
          textCard: {
            text,
            buttons: [
              {
                action: 'webLink',
                label: '실시간 진행상황 조회',
                webLinkUrl: buildTrackUrl(productOrderId),
              },
            ],
          },
        },
      ],
    },
  }
}

// ───────────────────────── 핸들러 ─────────────────────────

// 구매자가 등록 양식을 보냈을 때 — 파싱·저장 후 접수 확인/되묻기 응답
export async function submitRegistrationSkillHandler(req: Request, res: Response): Promise<void> {
  const { userRequest } = skillRequestSchema.parse(req.body)
  const result = await submitRegistration(userRequest.utterance, userRequest.user.id)
  res.json(buildSkillResponse(result.registration, result.missingFields, result.matchedOrder))
}

// 되묻기 답변 처리 — 진행 중 접수의 누락 항목을 채운다.
export async function answerMissingFieldSkillHandler(req: Request, res: Response): Promise<void> {
  const { userRequest } = skillRequestSchema.parse(req.body)
  const result = await answerMissingField(userRequest.user.id, userRequest.utterance)

  if (!result.found || !result.registration) {
    res.json(
      simpleTextResponse(
        '진행 중인 접수 내역을 찾지 못했어요. 스팀 등록 양식을 다시 보내주시겠어요?',
      ),
    )
    return
  }

  res.json(buildSkillResponse(result.registration, result.missingFields, result.matchedOrder))
}
