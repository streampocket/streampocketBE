import { DeliveryChannel, DeliveryLog, DeliveryLogStatus } from '@prisma/client'
import { prisma } from '../lib/prisma'

type CreateDeliveryLogInput = {
  orderItemId: string
  channel: DeliveryChannel
  recipient: string
}

type UpdateDeliveryLogInput = {
  status?: DeliveryLogStatus
  errorMessage?: string | null
  providerMessageId?: string | null
  sentAt?: Date | null
}

export async function createDeliveryLog(data: CreateDeliveryLogInput): Promise<DeliveryLog> {
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
