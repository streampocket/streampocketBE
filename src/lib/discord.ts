export type DiscordChannel = 'order' | 'stock' | 'error' | 'expense' | 'settlement'

const CHANNEL_META: Record<DiscordChannel, { title: string; color: number }> = {
  order: { title: '주문 알림', color: 0x57f287 },
  stock: { title: '재고 알림', color: 0xfee75c },
  error: { title: '오류 알림', color: 0xed4245 },
  expense: { title: '비용 등록 알림', color: 0xe67e22 },
  settlement: { title: '주간 정산', color: 0x5865f2 },
}

function getWebhookUrl(channel: DiscordChannel): string | undefined {
  if (channel === 'expense') return process.env['DISCORD_EXPENSE_WEBHOOK_URL']
  if (channel === 'settlement') return process.env['DISCORD_SETTLEMENT_WEBHOOK_URL']
  return process.env['DISCORD_WEBHOOK_URL']
}

export async function sendDiscordAlert(
  channel: DiscordChannel,
  message: string,
): Promise<void> {
  const url = getWebhookUrl(channel)
  if (!url) return

  const { title, color } = CHANNEL_META[channel]

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [
        {
          title,
          description: message,
          color,
          timestamp: new Date().toISOString(),
        },
      ],
    }),
  })
}
