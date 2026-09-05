import { Prisma } from '@prisma/client'
import { prisma } from '../../lib/prisma'

// 파티원은 만료일 → 시작 시각 순. startTime이 'HH:mm'이라 사전순 정렬이 곧 시간순이다.
const MEMBER_ORDER: Prisma.DramaMemberOrderByWithRelationInput[] = [
  { endDate: 'asc' },
  { startTime: 'asc' },
]

const WITH_MEMBERS = { members: { orderBy: MEMBER_ORDER } } satisfies Prisma.DramaAccountInclude

export type DramaAccountWithMembers = Prisma.DramaAccountGetPayload<{ include: typeof WITH_MEMBERS }>

/** 전건 조회 — 필터·검색·정렬은 프론트가 담당하므로 서버는 거르지 않는다 */
export function findAllDramaAccounts() {
  return prisma.dramaAccount.findMany({
    include: WITH_MEMBERS,
    orderBy: [{ dueAt: 'asc' }, { email: 'asc' }],
  })
}

export function findDramaAccountById(id: string) {
  return prisma.dramaAccount.findUnique({ where: { id }, include: WITH_MEMBERS })
}

/** 자동 배정 후보 조회 — 빈자리 계산에 필요한 최소 컬럼만. 정렬은 화면·배정 순서와 같은 마감일 빠른 순 */
const ASSIGN_CANDIDATE_SELECT = {
  id: true,
  email: true,
  platform: true,
  capacity: true,
  dueAt: true,
  members: { select: { endDate: true, startTime: true } },
} satisfies Prisma.DramaAccountSelect

/**
 * 플랫폼·마감일로 1차로 거른 배정 후보.
 *
 * 빈자리(정원 − 활성 파티원)는 파티원 만료 시각까지 봐야 해서 SQL로 세지 않고
 * 호출측이 utils/dramaAssignment로 계산한다.
 * `tx`를 받는 이유: 배정은 트랜잭션 안에서 후보를 다시 읽어 동시 승인을 방어한다.
 */
export function findAssignCandidates(
  tx: Prisma.TransactionClient,
  input: { platforms: readonly string[]; minDueAt: Date },
) {
  return tx.dramaAccount.findMany({
    where: {
      platform: { in: [...input.platforms] },
      capacity: { not: null },
      dueAt: { gte: input.minDueAt },
    },
    select: ASSIGN_CANDIDATE_SELECT,
    orderBy: [{ dueAt: 'asc' }, { email: 'asc' }],
  })
}

export function findDramaAccountsByEmails(emails: string[]) {
  return prisma.dramaAccount.findMany({
    where: { email: { in: emails } },
    select: { id: true, email: true },
  })
}

export type DramaAccountWriteData = {
  email: string
  passwordEnc: string
  otpSecretEnc: string
  platform: string | null
  capacity: number | null
  capacityLabel: string | null
  dueAt: Date | null
  notes: string[]
}

export type DramaMemberWriteData = {
  site: string | null
  name: string
  siteSpaced: boolean
  endDate: Date
  startTime: string
  days: number
  suffix: string | null
}

export function createDramaAccount(data: DramaAccountWriteData, members: DramaMemberWriteData[]) {
  return prisma.dramaAccount.create({
    data: { ...data, members: { create: members } },
    include: WITH_MEMBERS,
  })
}

/**
 * 통째 교체 — 기존 파티원을 전부 지우고 메모 내용으로 다시 채운다.
 *
 * expectedUpdatedAt을 주면 그 값과 일치할 때만 교체한다(낙관적 잠금).
 * 조회 후 비교하면 그 사이에 끼어들 틈이 생기므로 where에 조건을 얹어 DB가 판정하게 한다.
 * 이 UPDATE가 행 잠금을 잡으므로 뒤따르는 트랜잭션은 커밋을 기다렸다가 바뀐 값을 본다.
 * 값이 다르면 그 사이 누군가 먼저 고친 것이므로 null을 돌려준다(호출측이 409로 옮긴다).
 */
export function replaceDramaAccount(
  id: string,
  data: DramaAccountWriteData,
  members: DramaMemberWriteData[],
  expectedUpdatedAt?: Date,
): Promise<DramaAccountWithMembers | null> {
  return prisma.$transaction(async (tx) => {
    if (expectedUpdatedAt) {
      const { count } = await tx.dramaAccount.updateMany({
        where: { id, updatedAt: expectedUpdatedAt },
        data: { updatedAt: new Date() },
      })
      if (count === 0) return null
    }
    await tx.dramaMember.deleteMany({ where: { accountId: id } })
    return tx.dramaAccount.update({
      where: { id },
      data: { ...data, members: { create: members } },
      include: WITH_MEMBERS,
    })
  })
}

export function deleteDramaAccountById(id: string) {
  return prisma.dramaAccount.delete({ where: { id } })
}

/** 계정에 속한 파티원만 지운다 — 다른 계정의 id가 넘어와도 삭제되지 않게 accountId를 함께 건다 */
export function deleteDramaMember(accountId: string, memberId: string) {
  return prisma.dramaMember.deleteMany({ where: { id: memberId, accountId } })
}

/**
 * 만료 파티원 일괄 삭제 — 어제까지 전부 + 오늘 중 만료 시각이 이미 지난 건.
 *
 * `startTime`이 만료 시각이라 날짜만 보면 오늘 01:30에 끝난 자리가 하루 종일 남는다.
 * 값이 'HH:mm' 고정폭(파서가 padStart로 보장)이라 문자열 lte가 곧 시간 비교다 —
 * 파티원 정렬(MEMBER_ORDER)도 이미 이 성질에 기대고 있다.
 */
export function deleteExpiredDramaMembers(accountId: string, today: Date, nowHhmm: string) {
  return prisma.dramaMember.deleteMany({
    where: {
      accountId,
      OR: [{ endDate: { lt: today } }, { endDate: today, startTime: { lte: nowHhmm } }],
    },
  })
}

/** 대량 등록 — 이관 리허설에서 171건을 한 번에 넣으므로 트랜잭션으로 묶는다 */
export function createDramaAccountsBulk(
  rows: { account: DramaAccountWriteData; members: DramaMemberWriteData[] }[],
) {
  return prisma.$transaction(
    rows.map((row) =>
      prisma.dramaAccount.create({ data: { ...row.account, members: { create: row.members } } }),
    ),
  )
}
