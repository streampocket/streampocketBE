import { Router } from 'express'
import {
  createDramaAccountTextHandler,
  deleteDramaAccountHandler,
  deleteDramaMemberHandler,
  deleteExpiredDramaMembersHandler,
  getDramaAccountsHandler,
  importDramaMemoHandler,
  updateDramaAccountTextHandler,
} from '../../controllers/own/dramaAccountController'
import { authMiddleware } from '../../middlewares/auth'
import { asyncHandler } from '../../utils/asyncHandler'

export const adminDramaAccountsRouter = Router()

// 계정 아이디·비밀번호·OTP 시크릿을 평문으로 내려주므로 전 경로가 관리자 전용이다
adminDramaAccountsRouter.use(authMiddleware)

adminDramaAccountsRouter.get('/', asyncHandler(getDramaAccountsHandler))

// 등록·수정은 폼이 아니라 메모 텍스트로 받는다. 둘 다 dryRun으로 미리보기를 겸한다
adminDramaAccountsRouter.post('/text', asyncHandler(createDramaAccountTextHandler))
adminDramaAccountsRouter.put('/:id/text', asyncHandler(updateDramaAccountTextHandler))

adminDramaAccountsRouter.post('/import', asyncHandler(importDramaMemoHandler))
adminDramaAccountsRouter.delete('/:id', asyncHandler(deleteDramaAccountHandler))

// '/members/expired'가 '/members/:memberId'보다 먼저 와야 expired가 id로 잡히지 않는다
adminDramaAccountsRouter.delete('/:id/members/expired', asyncHandler(deleteExpiredDramaMembersHandler))
adminDramaAccountsRouter.delete('/:id/members/:memberId', asyncHandler(deleteDramaMemberHandler))
