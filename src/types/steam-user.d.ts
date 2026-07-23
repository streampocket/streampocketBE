// steam-user(5.x)는 공식 TypeScript 타입을 제공하지 않으므로,
// 본 프로젝트에서 사용하는 API만 최소한으로 선언한다.
declare module 'steam-user' {
  type SteamUserOptions = {
    httpProxy?: string
    socksProxy?: string
  }

  type LogOnDetails = {
    refreshToken?: string
    accountName?: string
    password?: string
  }

  type QuickInviteToken = {
    invite_link: string
    invite_token: string
    invite_limit: number | null
    invite_duration: number | null
    time_created: Date
  }

  // loggedOn 이후 채워지는 SteamID 객체 (steamid 라이브러리) — 사용하는 필드만 선언
  type SteamID = {
    accountid: number
    getSteamID64(): string
  }

  class SteamUser {
    constructor(options?: SteamUserOptions)
    steamID: SteamID | null
    logOn(details: LogOnDetails): void
    logOff(): void
    createQuickInviteLink(options?: {
      inviteLimit?: number
      inviteDuration?: number | null
    }): Promise<{ token: QuickInviteToken }>
    on(event: 'loggedOn', listener: (details: unknown) => void): this
    on(event: 'error', listener: (err: Error) => void): this
    removeListener(event: 'loggedOn', listener: (details: unknown) => void): this
    removeListener(event: 'error', listener: (err: Error) => void): this
  }

  export = SteamUser
}
