import { Request, Response } from 'express'
import { z } from 'zod'
import { SteamOrderItem } from '@prisma/client'
import { FIELD_LABELS } from '../utils/steamRegistrationParser'
import { RegistrationWithOrder } from '../repositories/steamRegistrationRepository'
import { answerMissingField, submitRegistration } from '../services/steamRegistrationService'

// ───────────────────────── 카카오 i 오픈빌더 SkillResponse 타입 ─────────────────────────

type SkillButton =
  | { action: 'webLink'; label: string; webLinkUrl: string }
  | { action: 'operator'; label: string } // 상담원 연결 버튼 (URL 불필요)

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

// 양식이 아닌 일반 문의 — 안내 메시지 + 상담원 연결 버튼 응답
function buildOperatorHandoffResponse(): SkillResponse {
  return {
    version: '2.0',
    template: {
      outputs: [
        {
          textCard: {
            text: '스팀 등록 양식 접수만 자동으로 처리하고 있어요.\n다른 문의는 상담원이 도와드릴게요. 아래 버튼을 눌러주세요 🙏',
            buttons: [{ action: 'operator', label: '상담원 연결' }],
          },
        },
      ],
    },
  }
}

function buildSkillResponse(
  registration: RegistrationWithOrder,
  missingFields: string[],
  matchedOrder: SteamOrderItem | null,
): SkillResponse {
  // 누락 항목이 있으면 빠진 항목을 안내하고 양식 전체를 다시 보내달라고 요청한다.
  if (missingFields.length > 0) {
    const labels = missingFields.map((field) => FIELD_LABELS[field] ?? field).join(', ')
    return {
      version: '2.0',
      template: {
        outputs: [
          {
            simpleText: {
              text: `접수 양식을 확인했어요. 다음 항목이 빠진 것 같아요: ${labels}\n\n번거로우시겠지만 양식 전체를 다시 채워서 보내주시겠어요? 🙏`,
            },
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

  // 양식이 아닌 일반 문의는 저장하지 않고 상담원 연결로 안내한다.
  if (result.kind === 'non_form') {
    res.json(buildOperatorHandoffResponse())
    return
  }

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
