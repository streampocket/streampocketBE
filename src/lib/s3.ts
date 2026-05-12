import { randomUUID } from 'crypto'
import { S3Client, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const REGION = process.env.AWS_REGION
const BUCKET = process.env.S3_BUCKET_NAME
const PUBLIC_BASE = process.env.S3_PUBLIC_URL_BASE

function ensureConfigured(): { region: string; bucket: string; publicBase: string } {
  if (!REGION || !BUCKET || !PUBLIC_BASE) {
    throw Object.assign(new Error('S3 환경변수가 설정되지 않았습니다.'), { statusCode: 500 })
  }
  return { region: REGION, bucket: BUCKET, publicBase: PUBLIC_BASE.replace(/\/$/, '') }
}

let client: S3Client | null = null
function getClient(): S3Client {
  if (client) return client
  const { region } = ensureConfigured()
  client = new S3Client({
    region,
    ...(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
      ? {
          credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          },
        }
      : {}),
  })
  return client
}

const ALLOWED_CONTENT_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES = 5 * 1024 * 1024
const EXT_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export type PresignedUploadResult = {
  uploadUrl: string
  objectUrl: string
  key: string
}

export async function generateReviewImagePresignedUrl(params: {
  userId: string
  contentType: string
  contentLength: number
}): Promise<PresignedUploadResult> {
  if (!ALLOWED_CONTENT_TYPES.has(params.contentType)) {
    throw Object.assign(new Error('허용되지 않은 이미지 형식입니다. (jpg, png, webp만 가능)'), {
      statusCode: 400,
    })
  }
  if (params.contentLength <= 0 || params.contentLength > MAX_BYTES) {
    throw Object.assign(new Error('이미지 용량은 5MB 이하만 업로드할 수 있습니다.'), {
      statusCode: 400,
    })
  }

  const { bucket, publicBase } = ensureConfigured()
  const ext = EXT_BY_CONTENT_TYPE[params.contentType]
  const key = `own-reviews/${params.userId}/${randomUUID()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: params.contentType,
    ContentLength: params.contentLength,
  })
  const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn: 60 })

  return {
    uploadUrl,
    objectUrl: `${publicBase}/${key}`,
    key,
  }
}

export async function generateCommunityImagePresignedUrl(params: {
  authorType: 'user' | 'admin'
  authorId: string
  contentType: string
  contentLength: number
}): Promise<PresignedUploadResult> {
  if (!ALLOWED_CONTENT_TYPES.has(params.contentType)) {
    throw Object.assign(new Error('허용되지 않은 이미지 형식입니다. (jpg, png, webp만 가능)'), {
      statusCode: 400,
    })
  }
  if (params.contentLength <= 0 || params.contentLength > MAX_BYTES) {
    throw Object.assign(new Error('이미지 용량은 5MB 이하만 업로드할 수 있습니다.'), {
      statusCode: 400,
    })
  }

  const { bucket, publicBase } = ensureConfigured()
  const ext = EXT_BY_CONTENT_TYPE[params.contentType]
  const prefix = params.authorType === 'admin' ? `admin/${params.authorId}` : params.authorId
  const key = `community/${prefix}/${randomUUID()}.${ext}`

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: params.contentType,
    ContentLength: params.contentLength,
  })
  const uploadUrl = await getSignedUrl(getClient(), command, { expiresIn: 60 })

  return {
    uploadUrl,
    objectUrl: `${publicBase}/${key}`,
    key,
  }
}

export function isCommunityImageUrl(objectUrl: string): boolean {
  const { publicBase } = ensureConfigured()
  return objectUrl.startsWith(`${publicBase}/community/`)
}

export function keyFromObjectUrl(objectUrl: string): string | null {
  const { publicBase } = ensureConfigured()
  if (!objectUrl.startsWith(`${publicBase}/`)) return null
  return objectUrl.slice(publicBase.length + 1)
}

export async function deleteReviewImage(objectUrl: string): Promise<void> {
  const key = keyFromObjectUrl(objectUrl)
  if (!key) return
  const { bucket } = ensureConfigured()
  await getClient().send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
}
