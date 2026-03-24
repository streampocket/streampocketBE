import 'express'

declare module 'express' {
  // 단언 사유: declare module 병합은 interface만 가능 (type으로 대체 불가)
  interface Request {
    user?: {
      id: string
      email: string
    }
  }
}
