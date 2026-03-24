import { Request, Response } from 'express'
import { z } from 'zod'
import { getTemplate, updateTemplate } from '../services/emailTemplateService'

const updateSchema = z.object({
  subject: z.string().min(1).optional(),
  bodyTemplate: z.string().min(1).optional(),
})

export async function getEmailTemplateHandler(_req: Request, res: Response): Promise<void> {
  const template = await getTemplate()
  res.json({ data: template })
}

export async function updateEmailTemplateHandler(req: Request, res: Response): Promise<void> {
  const body = updateSchema.parse(req.body)
  const current = await getTemplate()
  const updated = await updateTemplate(
    body.subject ?? current.subject,
    body.bodyTemplate ?? current.bodyTemplate,
  )
  res.json({ data: updated })
}
