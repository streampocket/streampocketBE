import { Request, Response } from 'express'
import { z } from 'zod'
import {
  importDramaMemo,
  listDramaAccounts,
  removeDramaAccount,
  removeDramaMember,
  removeExpiredDramaMembers,
  saveDramaAccountFromText,
} from '../../services/own/dramaAccountService'

const importSchema = z.object({
  text: z.string().min(1, '메모 내용을 입력해 주세요.').max(500_000),
  dryRun: z.boolean().default(true),
  duplicateMode: z.enum(['skip', 'overwrite']).default('skip'),
})

// 계정 1건 편집 — 폼이 아니라 메모 텍스트를 통째로 받는다
const textSchema = z.object({
  text: z.string().min(1, '내용을 입력해 주세요.').max(20_000),
  dryRun: z.boolean().default(true),
  // 편집기를 열 때 받은 계정의 updatedAt. 수정 저장에서 낙관적 잠금 기준값이 된다.
  expectedUpdatedAt: z.string().datetime({ message: '올바른 버전 정보가 아닙니다.' }).optional(),
})

const idParam = z.string().uuid('올바른 식별자가 아닙니다.')

export async function getDramaAccountsHandler(_req: Request, res: Response): Promise<void> {
  const data = await listDramaAccounts()
  res.json({ data })
}

/** 신규 등록 — 빈 편집기에 적은 메모를 그대로 저장한다 */
export async function createDramaAccountTextHandler(req: Request, res: Response): Promise<void> {
  const body = textSchema.parse(req.body)
  const data = await saveDramaAccountFromText({ text: body.text, dryRun: body.dryRun })
  res.status(body.dryRun ? 200 : 201).json({ data })
}

/** 기존 계정 교체 — 파티원까지 텍스트 내용으로 통째 대체한다 */
export async function updateDramaAccountTextHandler(req: Request, res: Response): Promise<void> {
  const id = idParam.parse(req.params.id)
  const body = textSchema.parse(req.body)
  const data = await saveDramaAccountFromText({
    id,
    text: body.text,
    dryRun: body.dryRun,
    expectedUpdatedAt: body.expectedUpdatedAt,
  })
  res.json({ data })
}

export async function deleteDramaAccountHandler(req: Request, res: Response): Promise<void> {
  const id = idParam.parse(req.params.id)
  await removeDramaAccount(id)
  res.json({ message: '계정이 삭제되었습니다.' })
}

export async function deleteDramaMemberHandler(req: Request, res: Response): Promise<void> {
  const accountId = idParam.parse(req.params.id)
  const memberId = idParam.parse(req.params.memberId)
  await removeDramaMember(accountId, memberId)
  res.json({ message: '파티원이 삭제되었습니다.' })
}

export async function deleteExpiredDramaMembersHandler(req: Request, res: Response): Promise<void> {
  const accountId = idParam.parse(req.params.id)
  const result = await removeExpiredDramaMembers(accountId)
  res.json({ message: `만료 파티원 ${result.removed}명을 정리했습니다.`, ...result })
}

/** 붙여넣기 이관 — dryRun이면 저장하지 않고 읽은 결과만 돌려준다 (미리보기와 저장이 같은 코드) */
export async function importDramaMemoHandler(req: Request, res: Response): Promise<void> {
  const body = importSchema.parse(req.body)
  const data = await importDramaMemo(body.text, {
    dryRun: body.dryRun,
    duplicateMode: body.duplicateMode,
  })
  res.json({ data })
}
