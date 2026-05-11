import { DeliveryChannel, DeliveryLog, DeliveryLogStatus } from '@prisma/client'
import { prisma } from '../lib/prisma'

type CreateDeliveryLogInput = {
  orderItemId?: string
  partyApplicationId?: string
  channel: DeliveryChannel
  recipient: string
  templateCode?: string | null
}

type UpdateDeliveryLogInput = {
  status?: DeliveryLogStatus
  errorMessage?: string | null
  providerMessageId?: string | null
  sentAt?: Date | null
}

export async function createDeliveryLog(data: CreateDeliveryLogInput): Promise<DeliveryLog> {
  if (!data.orderItemId && !data.partyApplicationId) {
    throw new Error('createDeliveryLog: orderItemId 또는 partyApplicationId 중 하나는 필수입니다.')
  }
  return prisma.deliveryLog.create({ data })
}

export async function updateDeliveryLog(
  id: string,
  data: UpdateDeliveryLogInput,
): Promise<DeliveryLog> {
  return prisma.deliveryLog.update({
    where: { id },
    data,
  })
}

export async function findDeliveryLogsByPartyApplicationId(
  partyApplicationId: string,
): Promise<DeliveryLog[]> {
  return prisma.deliveryLog.findMany({
    where: { partyApplicationId, channel: 'alimtalk' },
    orderBy: { createdAt: 'desc' },
  })
}
