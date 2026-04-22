import { z } from 'zod'
import type { Request, Response } from 'express'
import {
  applyToParty,
  checkApplication,
  getMyApplications,
  getApplicationCredentials,
  PAY_METHOD_VALUES,
} from '../../services/own/partyApplicationService'

const idParamSchema = z.object({
  id: z.string().uuid(),
})

const applyBodySchema = z.object({
  payMethod: z.enum(PAY_METHOD_VALUES),
})

export async function applyToPartyHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const { payMethod } = applyBodySchema.parse(req.body)
  const userId = req.user!.id
  const result = await applyToParty(id, userId, payMethod)
  res.status(201).json(result)
}

export async function checkApplicationHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const userId = req.user!.id
  const result = await checkApplication(id, userId)
  res.json(result)
}

export async function getMyApplicationsHandler(req: Request, res: Response): Promise<void> {
  const userId = req.user!.id
  const result = await getMyApplications(userId)
  res.json(result)
}

export async function getApplicationCredentialsHandler(req: Request, res: Response): Promise<void> {
  const { id } = idParamSchema.parse(req.params)
  const userId = req.user!.id
  const result = await getApplicationCredentials(id, userId)
  res.json(result)
}
