import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const service = vi.hoisted(() => ({ getAuthenticatedAdmin: vi.fn() }))
vi.mock('../services/authService', () => service)

const { authMiddleware, requireOwner, requirePermission } = await import('./auth')

const SECRET = 'test-secret'
const OWNER = { id: 'owner-1', email: 'owner@test.com', role: 'owner', permissions: [] }
const STAFF = { id: 'staff-1', email: 'staff@test.com', role: 'staff', permissions: ['orders'] }

type MockRes = Response & { statusCode: number; body: unknown }

function mockRes(): MockRes {
  const res = { statusCode: 200, body: undefined } as MockRes // 단언 사유: 테스트용 최소 Response 목
  res.status = vi.fn((code: number) => {
    res.statusCode = code
    return res
  }) as MockRes['status'] // 단언 사유: vi.fn 반환 타입을 Response 메서드 시그니처로 맞춤
  res.json = vi.fn((body: unknown) => {
    res.body = body
    return res
  }) as MockRes['json'] // 단언 사유: 위와 동일
  return res
}

function reqWithToken(id: string): Request {
  const token = jwt.sign({ id, email: `${id}@test.com` }, SECRET)
  return { headers: { authorization: `Bearer ${token}` } } as Request // 단언 사유: 테스트용 최소 Request 목
}

beforeEach(() => {
  vi.clearAllMocks()
  process.env.JWT_SECRET = SECRET
})

describe('authMiddleware — 요청마다 DB 재조회', () => {
  it('활성 계정이면 req.admin을 채우고 통과', async () => {
    service.getAuthenticatedAdmin.mockResolvedValue(STAFF)
    const req = reqWithToken('staff-1')
    const res = mockRes()
    const next = vi.fn()
    await authMiddleware(req, res, next)
    expect(next).toHaveBeenCalledWith()
    expect(req.admin).toEqual(STAFF)
    expect(req.user).toEqual({ id: 'staff-1', email: 'staff@test.com' })
  })

  it('비활성·삭제 계정(조회 결과 없음)이면 유효한 토큰이어도 401', async () => {
    service.getAuthenticatedAdmin.mockResolvedValue(null)
    const res = mockRes()
    const next = vi.fn()
    await authMiddleware(reqWithToken('staff-1'), res, next)
    expect(res.statusCode).toBe(401)
    expect(next).not.toHaveBeenCalled()
  })

  it('잘못된 서명은 DB 조회 없이 401', async () => {
    const req = { headers: { authorization: 'Bearer invalid' } } as Request // 단언 사유: 테스트용 최소 Request 목
    const res = mockRes()
    await authMiddleware(req, res, vi.fn())
    expect(res.statusCode).toBe(401)
    expect(service.getAuthenticatedAdmin).not.toHaveBeenCalled()
  })

  it('DB 오류는 next(err)로 넘긴다', async () => {
    const err = new Error('db down')
    service.getAuthenticatedAdmin.mockRejectedValue(err)
    const next = vi.fn()
    await authMiddleware(reqWithToken('owner-1'), mockRes(), next)
    expect(next).toHaveBeenCalledWith(err)
  })
})

function run(mw: (req: Request, res: Response, next: NextFunction) => void, admin: unknown) {
  const req = { admin } as Request // 단언 사유: 테스트용 최소 Request 목
  const res = mockRes()
  const next = vi.fn()
  mw(req, res, next)
  return { res, next }
}

describe('requirePermission', () => {
  it('사장은 권한 목록과 무관하게 통과', () => {
    const { next } = run(requirePermission('revenue'), OWNER)
    expect(next).toHaveBeenCalled()
  })

  it('직원은 권한이 있으면 통과, 없으면 403', () => {
    expect(run(requirePermission('orders'), STAFF).next).toHaveBeenCalled()
    const { res, next } = run(requirePermission('revenue'), STAFF)
    expect(res.statusCode).toBe(403)
    expect(next).not.toHaveBeenCalled()
  })

  it('여러 키 중 하나만 있어도 통과 (공유 API)', () => {
    expect(run(requirePermission('revenue', 'orders'), STAFF).next).toHaveBeenCalled()
  })

  it('인증 정보가 없으면 401', () => {
    expect(run(requirePermission('orders'), undefined).res.statusCode).toBe(401)
  })
})

describe('requireOwner', () => {
  it('사장만 통과, 직원은 권한이 많아도 403', () => {
    expect(run(requireOwner, OWNER).next).toHaveBeenCalled()
    const allPerms = { ...STAFF, permissions: ['orders', 'revenue', 'dashboard'] }
    expect(run(requireOwner, allPerms).res.statusCode).toBe(403)
  })
})
