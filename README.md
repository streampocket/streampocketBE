# 스트림포켓 백엔드

스트림포켓 관리자 시스템의 백엔드 서버.
네이버 스마트스토어 주문 자동화 및 관리자 API를 제공한다.

---

## 기술 스택

| 항목 | 기술 |
|------|------|
| 런타임 | Node.js 20 |
| 프레임워크 | Express 5 + TypeScript |
| ORM | Prisma 6 |
| DB | PostgreSQL 16 |
| 인증 | JWT |
| 이메일 | Resend |
| 알림 | Discord Webhook, 알리고 알림톡 |
| 문서 | Swagger UI (`/api/docs`) |

---

## 로컬 개발 환경

### 사전 요구사항

- Docker Desktop 실행 중
- Node.js 20+

### 실행

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env  # 없으면 .env 직접 작성

# 3. 로컬 DB + 서버 실행
docker compose up -d

# 4. DB 마이그레이션
npm run db:migrate

# 5. 초기 데이터 (관리자 계정 생성)
npm run db:seed
```

### 주의사항 (Windows Docker)

Windows 환경에서 Docker 볼륨 마운트 시 파일 변경이 hot reload에 자동 반영되지 않는다.
코드 수정 후 반드시 컨테이너를 재시작해야 한다.

```bash
docker compose restart be
```

---

## 환경변수 (.env)

| 변수 | 설명 |
|------|------|
| `PORT` | 서버 포트 (기본 4000) |
| `NODE_ENV` | `development` \| `production` |
| `FE_ORIGIN` | 프론트엔드 origin (CORS) |
| `DATABASE_URL` | PostgreSQL 연결 URL |
| `NAVER_CLIENT_ID` | 네이버 커머스 API 클라이언트 ID |
| `NAVER_CLIENT_SECRET` | 네이버 커머스 API 시크릿 |
| `NAVER_SELLER_ID` | 네이버 판매자 ID |
| `NAVER_API_BASE_URL` | 네이버 API 베이스 URL |
| `RESEND_API_KEY` | Resend 이메일 API 키 |
| `MAIL_FROM_ADDRESS` | 발신 이메일 주소 |
| `MAIL_FROM_NAME` | 발신자 이름 |
| `ALIGO_API_KEY` | 알리고 알림톡 API 키 |
| `ALIGO_USER_ID` | 알리고 사용자 ID |
| `ALIGO_SENDER_KEY` | 알리고 발신키 |
| `ALIGO_TEMPLATE_CODE` | 알림톡 템플릿 코드 |
| `ALIGO_SENDER` | 발신 전화번호 |
| `DISCORD_WEBHOOK_URL` | Discord 알림 Webhook URL |
| `JWT_SECRET` | JWT 서명 시크릿 |
| `JWT_EXPIRES_IN` | JWT 만료 기간 (예: `7d`) |
| `ADMIN_EMAIL` | 초기 관리자 이메일 (`db:seed` 사용) |
| `ADMIN_PASSWORD` | 초기 관리자 비밀번호 (`db:seed` 사용) |
| `LOW_STOCK_THRESHOLD` | 재고 부족 알림 임계치 (기본 2) |
| `ORDER_POLL_INTERVAL_SECONDS` | 주문 폴링 간격 초 (기본 300) |
| `MAX_RETRY_COUNT` | 최대 재시도 횟수 (기본 5) |

> 프로덕션 환경변수는 EC2 `/app/.env`에서 직접 관리. 자세한 내용은 루트의 `INFRA.md` 참고.

---

## 스크립트

```bash
npm run dev          # 개발 서버 (localhost:4000)
npm run build        # TypeScript 빌드
npm run db:generate  # Prisma 클라이언트 재생성
npm run db:migrate   # DB 마이그레이션 (개발)
npm run db:deploy    # DB 마이그레이션 (프로덕션)
npm run db:studio    # Prisma Studio (DB GUI)
npm run db:seed      # 초기 데이터 삽입 (관리자 계정)
```

---

## API 구조

| 경로 | 설명 |
|------|------|
| `GET /health` | 헬스체크 |
| `POST /auth/login` | 관리자 로그인 |
| `GET /api/docs` | Swagger API 문서 |
| `/steam/admin/*` | 스마트스토어 관리자 API |
| `/steam/cron/*` | 폴링 트리거 (외부 스케줄러용) |

---

## 배포

main 브랜치에 push하면 GitHub Actions가 자동 실행된다.

```
push → 빌드 → ECR push → EC2 배포 → prisma migrate deploy
```

수동 배포 및 운영 방법은 루트의 `INFRA.md` 참고.

---

## 도메인 구성

| 환경 | URL |
|------|-----|
| 로컬 | http://localhost:4000 |
| 프로덕션 | https://api.ottall.com (DNS 설정 후) |
| Swagger | http://43.200.94.182:4000/api/docs |

---

## 주요 비즈니스 로직

### 네이버 스마트스토어 주문 처리 흐름

```
폴링 (5분 간격)
  → 네이버 API에서 결제 완료 주문 조회
  → 코드 선점 (재시도 방지)
  → 발주 확인 처리
  → 알림톡 발송
  → 상태 완료 처리
  → Discord 알림
```

### 핵심 규칙

- 코드 소진 순서: `createdAt` 오름차순 (FIFO)
- 재발송 시: 기존 연결된 코드 재사용 (신규 코드 소진 금지)
- 이메일 없으면: `manual_review` 상태로 전환
- 재고 ≤2개: Discord 경고 / 0개: Discord 긴급
