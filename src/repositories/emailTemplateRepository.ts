import { prisma } from '../lib/prisma'
import { EmailTemplate } from '@prisma/client'

export async function getEmailTemplate(): Promise<EmailTemplate | null> {
  return prisma.emailTemplate.findFirst()
}

export async function upsertEmailTemplate(
  subject: string,
  bodyTemplate: string,
): Promise<EmailTemplate> {
  const existing = await prisma.emailTemplate.findFirst()
  if (existing) {
    return prisma.emailTemplate.update({
      where: { id: existing.id },
      data: { subject, bodyTemplate },
    })
  }
  return prisma.emailTemplate.create({ data: { subject, bodyTemplate } })
}
