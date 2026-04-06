import { Router } from 'express'
import {
  signupHandler,
  loginHandler,
  phoneSendHandler,
  phoneVerifyHandler,
  kakaoRedirectHandler,
  kakaoCallbackHandler,
  googleRedirectHandler,
  googleCallbackHandler,
  socialCompleteHandler,
  refreshHandler,
  logoutHandler,
} from '../../controllers/own/authController'
import { asyncHandler } from '../../utils/asyncHandler'

export const ownAuthRouter = Router()

// 이메일 인증
ownAuthRouter.post('/signup', asyncHandler(signupHandler))
ownAuthRouter.post('/login', asyncHandler(loginHandler))

// 전화번호 인증
ownAuthRouter.post('/phone/send', asyncHandler(phoneSendHandler))
ownAuthRouter.post('/phone/verify', asyncHandler(phoneVerifyHandler))

// 소셜 로그인
ownAuthRouter.get('/social/kakao', asyncHandler(kakaoRedirectHandler))
ownAuthRouter.get('/social/kakao/callback', asyncHandler(kakaoCallbackHandler))
ownAuthRouter.get('/social/google', asyncHandler(googleRedirectHandler))
ownAuthRouter.get('/social/google/callback', asyncHandler(googleCallbackHandler))
ownAuthRouter.post('/social/complete', asyncHandler(socialCompleteHandler))

// 토큰 갱신 / 로그아웃
ownAuthRouter.post('/refresh', asyncHandler(refreshHandler))
ownAuthRouter.post('/logout', asyncHandler(logoutHandler))
