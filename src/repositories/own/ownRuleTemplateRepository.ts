import { prisma } from '../../lib/prisma'

export function findAllOwnRuleTemplates() {
  return prisma.ownRuleTemplate.findMany({
    orderBy: { createdAt: 'asc' },
  })
}

export function findOwnRuleTemplateById(id: string) {
  return prisma.ownRuleTemplate.findUnique({ where: { id } })
}

export function findOwnRuleTemplateByName(name: string) {
  return prisma.ownRuleTemplate.findUnique({ where: { name } })
}

export function createOwnRuleTemplate(data: { name: string; content: string }) {
  return prisma.ownRuleTemplate.create({ data })
}

export function updateOwnRuleTemplate(id: string, data: { name?: string; content?: string }) {
  return prisma.ownRuleTemplate.update({ where: { id }, data })
}

export function deleteOwnRuleTemplateById(id: string) {
  return prisma.ownRuleTemplate.delete({ where: { id } })
}
