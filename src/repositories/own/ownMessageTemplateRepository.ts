import { prisma } from '../../lib/prisma'

type MessageTemplateInput = { name: string; content: string }

export function findAllOwnMessageTemplates() {
  return prisma.ownMessageTemplate.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  })
}

export function findAllOwnMessageTemplateIds() {
  return prisma.ownMessageTemplate.findMany({ select: { id: true } })
}

export function findOwnMessageTemplateById(id: string) {
  return prisma.ownMessageTemplate.findUnique({ where: { id } })
}

export function findOwnMessageTemplateByName(name: string) {
  return prisma.ownMessageTemplate.findUnique({ where: { name } })
}

export async function findMaxOwnMessageTemplateSortOrder(): Promise<number | null> {
  const result = await prisma.ownMessageTemplate.aggregate({ _max: { sortOrder: true } })
  return result._max.sortOrder
}

export function createOwnMessageTemplate(data: MessageTemplateInput & { sortOrder: number }) {
  return prisma.ownMessageTemplate.create({ data })
}

export function updateOwnMessageTemplate(id: string, data: Partial<MessageTemplateInput>) {
  return prisma.ownMessageTemplate.update({ where: { id }, data })
}

export function deleteOwnMessageTemplateById(id: string) {
  return prisma.ownMessageTemplate.delete({ where: { id } })
}

// 받은 id 순서대로 sortOrder를 0부터 다시 매긴다 (한 트랜잭션 — 중간 실패 시 순서가 반쯤 바뀌지 않게)
export function reorderOwnMessageTemplates(ids: string[]) {
  return prisma.$transaction(
    ids.map((id, index) =>
      prisma.ownMessageTemplate.update({ where: { id }, data: { sortOrder: index } }),
    ),
  )
}
