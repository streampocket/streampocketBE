# ─── Stage 1: 빌드 ───────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npx prisma generate
RUN npm run build

# ─── Stage 2: 프로덕션 실행 ───────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 4000
CMD ["node", "dist/server.js"]
