import {
  findAllOwnMessageTemplates,
  findAllOwnMessageTemplateIds,
  findOwnMessageTemplateById,
  findOwnMessageTemplateByName,
  findMaxOwnMessageTemplateSortOrder,
  createOwnMessageTemplate,
  updateOwnMessageTemplate,
  deleteOwnMessageTemplateById,
  reorderOwnMessageTemplates,
} from '../../repositories/own/ownMessageTemplateRepository'

const DUPLICATE_NAME_MESSAGE = '이미 존재하는 양식 이름입니다.'
const NOT_FOUND_MESSAGE = '양식을 찾을 수 없습니다.'

export function getOwnMessageTemplates() {
  return findAllOwnMessageTemplates()
}

// 새 양식은 맨 아래에 붙인다 — 기존 순서를 밀지 않기 위해
export async function createOwnMessageTemplateItem(data: { name: string; content: string }) {
  const existing = await findOwnMessageTemplateByName(data.name)
  if (existing) {
    throw Object.assign(new Error(DUPLICATE_NAME_MESSAGE), { statusCode: 409 })
  }
  const maxSortOrder = await findMaxOwnMessageTemplateSortOrder()
  return createOwnMessageTemplate({ ...data, sortOrder: maxSortOrder === null ? 0 : maxSortOrder + 1 })
}

export async function updateOwnMessageTemplateItem(
  id: string,
  data: { name?: string; content?: string },
) {
  const template = await findOwnMessageTemplateById(id)
  if (!template) {
    throw Object.assign(new Error(NOT_FOUND_MESSAGE), { statusCode: 404 })
  }
  if (data.name && data.name !== template.name) {
    const existing = await findOwnMessageTemplateByName(data.name)
    if (existing) {
      throw Object.assign(new Error(DUPLICATE_NAME_MESSAGE), { statusCode: 409 })
    }
  }
  return updateOwnMessageTemplate(id, data)
}

export async function deleteOwnMessageTemplateItem(id: string) {
  const template = await findOwnMessageTemplateById(id)
  if (!template) {
    throw Object.assign(new Error(NOT_FOUND_MESSAGE), { statusCode: 404 })
  }
  return deleteOwnMessageTemplateById(id)
}

// 전체 순서를 받는다 — 그사이 다른 화면에서 추가·삭제돼 목록이 달라졌으면 409로 막아 순서가 꼬이지 않게 한다
export async function reorderOwnMessageTemplateItems(ids: string[]) {
  const current = await findAllOwnMessageTemplateIds()
  const currentIds = new Set(current.map((row) => row.id))
  const sameSet =
    ids.length === currentIds.size &&
    new Set(ids).size === ids.length &&
    ids.every((id) => currentIds.has(id))
  if (!sameSet) {
    throw Object.assign(
      new Error('양식 목록이 바뀌었습니다. 새로고침 후 다시 시도해 주세요.'),
      { statusCode: 409 },
    )
  }
  await reorderOwnMessageTemplates(ids)
  return findAllOwnMessageTemplates()
}
