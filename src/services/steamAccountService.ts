import { AccountStatus } from '@prisma/client'
import {
  listAccounts,
  exportAccounts,
  bulkCreateAccounts,
  disableAccount as disableAccountRepo,
  countAvailableAccountsByGame,
  findAccountById,
  updateAccount as updateAccountRepo,
  deleteAccount as deleteAccountRepo,
} from '../repositories/steamAccountRepository'
import { findProductById } from '../repositories/steamProductRepository'
import { findGameById } from '../repositories/steamGameRepository'

type ListAccountsInput = {
  gameId?: string
  productId?: string
  status?: AccountStatus
  page: number
  pageSize: number
}

type ExportAccountsInput = {
  gameId?: string
  productId?: string
  status?: AccountStatus
}

type BulkCreateInput = {
  gameId: string
  accounts: {
    username: string
    password: string
    email: string
    emailPassword: string
    emailSiteUrl: string
    secondaryEmail?: string
    secondaryEmailPassword?: string
    secondaryEmailSiteUrl?: string
  }[]
}

type UpdateAccountInput = {
  username: string
  password: string
  email: string
  emailPassword: string
  emailSiteUrl: string
  secondaryEmail?: string | null
  secondaryEmailPassword?: string | null
  secondaryEmailSiteUrl?: string | null
}

export async function getAccounts(input: ListAccountsInput) {
  return listAccounts(input)
}

export async function exportAccountsForExcel(input: ExportAccountsInput) {
  return exportAccounts(input)
}

export async function bulkCreate(input: BulkCreateInput) {
  const game = await findGameById(input.gameId)
  if (!game) {
    throw Object.assign(new Error('게임을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  // 계정 재고 등록 대상은 NA·BG만 — AA는 계정 재고를 사용하지 않는다
  if (game.productType === 'AA') {
    throw Object.assign(new Error('AA 상품은 계정 재고를 사용하지 않습니다.'), {
      statusCode: 400,
    })
  }
  // 레거시 브리지: 스트림포켓 게임은 레거시 SteamProduct.id를 게임 id로 재사용하므로
  // 동일 id의 레거시 상품이 있으면 productId도 함께 기록 (레거시 경로 조회 호환)
  const legacyProduct = await findProductById(input.gameId)
  const count = await bulkCreateAccounts(input.accounts, {
    gameId: input.gameId,
    productId: legacyProduct?.id ?? null,
    productNameSnapshot: game.name,
  })
  const available = await countAvailableAccountsByGame(input.gameId)
  return { created: count, availableTotal: available }
}

export async function disable(id: string) {
  return disableAccountRepo(id)
}

export async function updateAccount(id: string, data: UpdateAccountInput) {
  const account = await findAccountById(id)

  if (!account) {
    throw Object.assign(new Error('계정을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  return updateAccountRepo(id, data)
}

export async function deleteAccount(id: string) {
  const account = await findAccountById(id)

  if (!account) {
    throw Object.assign(new Error('계정을 찾을 수 없습니다.'), { statusCode: 404 })
  }

  if (account.status === 'sent') {
    throw Object.assign(new Error('발송 완료된 계정은 삭제할 수 없습니다.'), {
      statusCode: 400,
    })
  }

  return deleteAccountRepo(id)
}
