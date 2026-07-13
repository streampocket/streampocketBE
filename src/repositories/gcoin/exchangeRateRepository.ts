import { prisma } from '../../lib/prisma'

const USD = 'USD'
const KRW = 'KRW'

export function upsertUsdKrwRate(rate: number, fetchedAt: Date) {
  return prisma.exchangeRate.upsert({
    where: {
      baseCurrency_quoteCurrency: { baseCurrency: USD, quoteCurrency: KRW },
    },
    create: { baseCurrency: USD, quoteCurrency: KRW, rate, fetchedAt },
    update: { rate, fetchedAt },
  })
}

export function findUsdKrwRate() {
  return prisma.exchangeRate.findUnique({
    where: {
      baseCurrency_quoteCurrency: { baseCurrency: USD, quoteCurrency: KRW },
    },
  })
}
