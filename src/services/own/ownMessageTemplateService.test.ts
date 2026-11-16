import { beforeEach, describe, expect, it, vi } from 'vitest'

const repo = vi.hoisted(() => ({
  findAllOwnMessageTemplates: vi.fn(),
  findAllOwnMessageTemplateIds: vi.fn(),
  findOwnMessageTemplateById: vi.fn(),
  findOwnMessageTemplateByName: vi.fn(),
  findMaxOwnMessageTemplateSortOrder: vi.fn(),
  createOwnMessageTemplate: vi.fn(),
  updateOwnMessageTemplate: vi.fn(),
  deleteOwnMessageTemplateById: vi.fn(),
  reorderOwnMessageTemplates: vi.fn(),
}))

vi.mock('../../repositories/own/ownMessageTemplateRepository', () => repo)

const {
  createOwnMessageTemplateItem,
  updateOwnMessageTemplateItem,
  deleteOwnMessageTemplateItem,
  reorderOwnMessageTemplateItems,
} = await import('./ownMessageTemplateService')

const A = '11111111-1111-1111-1111-111111111111'
const B = '22222222-2222-2222-2222-222222222222'
const C = '33333333-3333-3333-3333-333333333333'

beforeEach(() => {
  vi.clearAllMocks()
  repo.findAllOwnMessageTemplateIds.mockResolvedValue([{ id: A }, { id: B }, { id: C }])
  repo.findAllOwnMessageTemplates.mockResolvedValue([])
})

describe('양식 생성', () => {
  it('맨 아래(현재 최대 순서 + 1)에 붙인다', async () => {
    repo.findOwnMessageTemplateByName.mockResolvedValue(null)
    repo.findMaxOwnMessageTemplateSortOrder.mockResolvedValue(4)

    await createOwnMessageTemplateItem({ name: '계정 안내', content: '본문' })

    expect(repo.createOwnMessageTemplate).toHaveBeenCalledWith({
      name: '계정 안내',
      content: '본문',
      sortOrder: 5,
    })
  })

  it('첫 양식은 순서 0', async () => {
    repo.findOwnMessageTemplateByName.mockResolvedValue(null)
    repo.findMaxOwnMessageTemplateSortOrder.mockResolvedValue(null)

    await createOwnMessageTemplateItem({ name: '첫 양식', content: '본문' })

    expect(repo.createOwnMessageTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ sortOrder: 0 }),
    )
  })

  it('같은 이름이 있으면 409', async () => {
    repo.findOwnMessageTemplateByName.mockResolvedValue({ id: A, name: '계정 안내' })

    await expect(createOwnMessageTemplateItem({ name: '계정 안내', content: '본문' })).rejects.toMatchObject({
      statusCode: 409,
    })
    expect(repo.createOwnMessageTemplate).not.toHaveBeenCalled()
  })
})

describe('양식 수정·삭제', () => {
  it('없는 양식 수정은 404', async () => {
    repo.findOwnMessageTemplateById.mockResolvedValue(null)
    await expect(updateOwnMessageTemplateItem(A, { content: 'x' })).rejects.toMatchObject({ statusCode: 404 })
  })

  it('다른 양식과 이름이 겹치면 409, 자기 이름 그대로면 통과', async () => {
    repo.findOwnMessageTemplateById.mockResolvedValue({ id: A, name: '기존' })
    repo.findOwnMessageTemplateByName.mockResolvedValue({ id: B, name: '다른 양식' })
    await expect(updateOwnMessageTemplateItem(A, { name: '다른 양식' })).rejects.toMatchObject({
      statusCode: 409,
    })

    await updateOwnMessageTemplateItem(A, { name: '기존', content: '새 본문' })
    expect(repo.updateOwnMessageTemplate).toHaveBeenCalledWith(A, { name: '기존', content: '새 본문' })
  })

  it('없는 양식 삭제는 404', async () => {
    repo.findOwnMessageTemplateById.mockResolvedValue(null)
    await expect(deleteOwnMessageTemplateItem(A)).rejects.toMatchObject({ statusCode: 404 })
    expect(repo.deleteOwnMessageTemplateById).not.toHaveBeenCalled()
  })
})

describe('양식 순서 변경', () => {
  it('전체 id를 받으면 그 순서로 저장한다', async () => {
    await reorderOwnMessageTemplateItems([C, A, B])
    expect(repo.reorderOwnMessageTemplates).toHaveBeenCalledWith([C, A, B])
  })

  it.each([
    ['빠진 id', [A, B]],
    ['모르는 id 추가', [A, B, C, '44444444-4444-4444-4444-444444444444']],
    ['모르는 id로 교체', [A, B, '44444444-4444-4444-4444-444444444444']],
    ['중복 id', [A, A, B]],
  ])('%s → 409 (그사이 목록이 바뀐 경우)', async (_label, ids) => {
    await expect(reorderOwnMessageTemplateItems(ids)).rejects.toMatchObject({ statusCode: 409 })
    expect(repo.reorderOwnMessageTemplates).not.toHaveBeenCalled()
  })
})
