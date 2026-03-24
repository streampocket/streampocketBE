type DiscordChannel = 'order' | 'stock' | 'error'

const WEBHOOK_URLS: Record<DiscordChannel, string | undefined> = {
  order: process.env.DISCORD_WEBHOOK_ORDER,
  stock: process.env.DISCORD_WEBHOOK_STOCK,
  error: process.env.DISCORD_WEBHOOK_ERROR,
}

export async function sendDiscordAlert(
  channel: DiscordChannel,
  message: string,
): Promise<void> {
  const url = WEBHOOK_URLS[channel]
  if (!url) return

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: message }),
  })
}
