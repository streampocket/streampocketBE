import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

// AES-256-GCM 대칭 암호화 — 파티 OTP 시크릿 등 민감 문자열 저장용.
// 키: env OTP_SECRET_ENC_KEY (64자 hex = 32바이트). 미설정/형식 오류 시 사용 시점에 500으로 실패.
// 출력 포맷: "v1:<iv b64>:<authTag b64>:<ciphertext b64>" — 버전 프리픽스로 향후 키/알고리즘 교체 대비

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const VERSION = 'v1'

function getEncryptionKey(): Buffer {
  const hex = process.env.OTP_SECRET_ENC_KEY
  if (!hex || !/^[0-9a-fA-F]{64}$/.test(hex)) {
    throw Object.assign(
      new Error('OTP_SECRET_ENC_KEY 환경변수가 없거나 형식이 올바르지 않습니다. (64자 hex 필요)'),
      { statusCode: 500 },
    )
  }
  return Buffer.from(hex, 'hex')
}

export function encryptSecret(plain: string): string {
  const key = getEncryptionKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const ciphertext = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  return [VERSION, iv.toString('base64'), authTag.toString('base64'), ciphertext.toString('base64')].join(':')
}

export function decryptSecret(enc: string): string {
  const key = getEncryptionKey()
  const parts = enc.split(':')
  if (parts.length !== 4 || parts[0] !== VERSION) {
    throw Object.assign(new Error('암호문 형식이 올바르지 않습니다.'), { statusCode: 500 })
  }
  const [, ivB64, authTagB64, ciphertextB64] = parts
  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(ivB64, 'base64'))
  decipher.setAuthTag(Buffer.from(authTagB64, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(ciphertextB64, 'base64')), decipher.final()]).toString('utf8')
}
