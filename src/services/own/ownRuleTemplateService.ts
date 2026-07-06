import {
  findAllOwnRuleTemplates,
  findOwnRuleTemplateById,
  findOwnRuleTemplateByName,
  createOwnRuleTemplate,
  updateOwnRuleTemplate,
  deleteOwnRuleTemplateById,
} from '../../repositories/own/ownRuleTemplateRepository'

export function getOwnRuleTemplates() {
  return findAllOwnRuleTemplates()
}

export async function createOwnRuleTemplateItem(data: { name: string; content: string }) {
  const existing = await findOwnRuleTemplateByName(data.name)
  if (existing) {
    throw Object.assign(new Error('이미 존재하는 템플릿 이름입니다.'), { statusCode: 409 })
  }
  return createOwnRuleTemplate(data)
}

export async function updateOwnRuleTemplateItem(
  id: string,
  data: { name?: string; content?: string },
) {
  const template = await findOwnRuleTemplateById(id)
  if (!template) {
    throw Object.assign(new Error('템플릿을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (data.name && data.name !== template.name) {
    const existing = await findOwnRuleTemplateByName(data.name)
    if (existing) {
      throw Object.assign(new Error('이미 존재하는 템플릿 이름입니다.'), { statusCode: 409 })
    }
  }
  return updateOwnRuleTemplate(id, data)
}

export async function deleteOwnRuleTemplateItem(id: string) {
  const template = await findOwnRuleTemplateById(id)
  if (!template) {
    throw Object.assign(new Error('템플릿을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return deleteOwnRuleTemplateById(id)
}
