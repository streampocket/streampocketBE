export type DiscordChannel = 'order' | 'stock' | 'error'

// 채널별 제목과 색상 (Discord embed color: decimal)
const CHANNEL_META: Record<DiscordChannel, { title: string; color: number }> = {
  order: { title: '주문 알림', color: 0x57f287 },  // 초록
  stock: { title: '재고 알림', color: 0xfee75c },  // 노랑
  error: { title: '오류 알림', color: 0xed4245 },  // 빨강
}

export async function sendDiscordAlert(
  channel: DiscordChannel,
  message: string,
): Promise<void> {
  const url = process.env['DISCORD_WEBHOOK_URL']
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
