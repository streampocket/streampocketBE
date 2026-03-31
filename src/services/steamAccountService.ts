import { AccountStatus } from '@prisma/client'
import {
  listAccounts,
  exportAccounts,
  bulkCreateAccounts,
  disableAccount as disableAccountRepo,
  countAvailableAccounts,
  findAccountById,
  updateAccount as updateAccountRepo,
  deleteAccount as deleteAccountRepo,
} from '../repositories/steamAccountRepository'
import { findProductById } from '../repositories/steamProductRepository'

type ListAccountsInput = {
  productId?: string
  status?: AccountStatus
  page: number
  pageSize: number
}

type ExportAccountsInput = {
  productId?: string
  status?: AccountStatus
}

type BulkCreateInput = {
  productId: string
  accounts: {
    username: string
    password: string
    email: string
    emailPassword: string
    emailSiteUrl: string
  }[]
}

type UpdateAccountInput = {
  username: string
  password: string
  email: string
  emailPassword: string
  emailSiteUrl: string
}

export async function getAccounts(input: ListAccountsInput) {
  return listAccounts(input)
}

export async function exportAccountsForExcel(input: ExportAccountsInput) {
  return exportAccounts(input)
}

export async function bulkCreate(input: BulkCreateInput) {
  const product = await findProductById(input.productId)
  if (!product) {
    throw Object.assign(new Error('상품을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  const count = await bulkCreateAccounts(input.productId, input.accounts, product.name)
  const available = await countAvailableAccounts(input.productId)
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
