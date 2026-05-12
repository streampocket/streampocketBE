import {
  createPost,
  findAllPostIdsForSitemap,
  findPinnedNotices,
  findPostById,
  findPostByIdRaw,
  findPostsForPublic,
  softDeletePost,
  updatePost,
} from '../../repositories/community/communityPostRepository'
import { generateCommunityImagePresignedUrl, isCommunityImageUrl } from '../../lib/s3'

const PAGE_SIZE = 20
const PINNED_LIMIT = 3
const ADMIN_AUTHOR_LABEL = '관리자'
const DELETED_USER_LABEL = '(탈퇴 회원)'

type PostDb = Awaited<ReturnType<typeof findPostById>>
type PostDbNonNull = NonNullable<PostDb>

export type CommunityPostDto = {
  id: string
  category: 'notice' | 'free'
  title: string
  content: string
  imageUrl: string | null
  authorType: 'user' | 'admin'
  authorId: string | null
  authorName: string
  createdAt: Date
  updatedAt: Date
}

function toDto(post: PostDbNonNull): CommunityPostDto {
  const isAdmin = post.category === 'notice'
  const authorName = isAdmin
    ? ADMIN_AUTHOR_LABEL
    : post.authorUser?.name ?? DELETED_USER_LABEL

  return {
    id: post.id,
    category: post.category,
    title: post.title,
    content: post.content,
    imageUrl: post.imageUrl,
    authorType: isAdmin ? 'admin' : 'user',
    authorId: isAdmin ? post.authorAdminId : post.authorUserId,
    authorName,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  }
}

function validateImageUrl(imageUrl: string | null): void {
  if (imageUrl === null) return
  if (!isCommunityImageUrl(imageUrl)) {
    throw Object.assign(new Error('허용되지 않은 이미지 URL입니다.'), { statusCode: 400 })
  }
}

export async function listPostsForPublic(params: {
  page: number
  category?: 'notice' | 'free'
}): Promise<{
  items: CommunityPostDto[]
  total: number
  page: number
  pageSize: number
  pinnedNotices: CommunityPostDto[]
}> {
  const { page, category } = params
  const { items, total } = await findPostsForPublic({ page, pageSize: PAGE_SIZE, category })

  const pinned = page === 1 && !category ? await findPinnedNotices(PINNED_LIMIT) : []

  return {
    items: items.map(toDto),
    total,
    page,
    pageSize: PAGE_SIZE,
    pinnedNotices: pinned.map(toDto),
  }
}

export async function getPost(id: string): Promise<CommunityPostDto> {
  const post = await findPostById(id)
  if (!post) {
    throw Object.assign(new Error('게시글을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  return toDto(post)
}

export async function listPostIdsForSitemap(): Promise<{ id: string; updatedAt: Date }[]> {
  return findAllPostIdsForSitemap()
}

// ─────────────── 회원 ───────────────

export async function createFreePostByUser(params: {
  userId: string
  title: string
  content: string
  imageUrl: string | null
}): Promise<CommunityPostDto> {
  validateImageUrl(params.imageUrl)
  const created = await createPost({
    category: 'free',
    title: params.title,
    content: params.content,
    imageUrl: params.imageUrl,
    authorUserId: params.userId,
    authorAdminId: null,
  })
  return toDto(created)
}

export async function updatePostByUser(params: {
  postId: string
  userId: string
  title: string
  content: string
  imageUrl: string | null
}): Promise<CommunityPostDto> {
  validateImageUrl(params.imageUrl)
  const post = await findPostByIdRaw(params.postId)
  if (!post || post.deletedAt) {
    throw Object.assign(new Error('게시글을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (post.category !== 'free' || post.authorUserId !== params.userId) {
    throw Object.assign(new Error('이 게시글을 수정할 권한이 없습니다.'), { statusCode: 403 })
  }
  const updated = await updatePost(params.postId, {
    title: params.title,
    content: params.content,
    imageUrl: params.imageUrl,
  })
  return toDto(updated)
}

export async function deletePostByUser(params: {
  postId: string
  userId: string
}): Promise<void> {
  const post = await findPostByIdRaw(params.postId)
  if (!post || post.deletedAt) {
    throw Object.assign(new Error('게시글을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  if (post.category !== 'free' || post.authorUserId !== params.userId) {
    throw Object.assign(new Error('이 게시글을 삭제할 권한이 없습니다.'), { statusCode: 403 })
  }
  await softDeletePost(params.postId)
}

export async function issueUserImageUploadUrl(params: {
  userId: string
  contentType: string
  contentLength: number
}) {
  return generateCommunityImagePresignedUrl({
    authorType: 'user',
    authorId: params.userId,
    contentType: params.contentType,
    contentLength: params.contentLength,
  })
}

// ─────────────── 관리자 ───────────────

export async function createPostByAdmin(params: {
  adminId: string
  category: 'notice' | 'free'
  title: string
  content: string
  imageUrl: string | null
}): Promise<CommunityPostDto> {
  validateImageUrl(params.imageUrl)
  const created = await createPost({
    category: params.category,
    title: params.title,
    content: params.content,
    imageUrl: params.imageUrl,
    authorUserId: null,
    authorAdminId: params.adminId,
  })
  return toDto(created)
}

export async function updatePostByAdmin(params: {
  postId: string
  title: string
  content: string
  imageUrl: string | null
  category: 'notice' | 'free'
}): Promise<CommunityPostDto> {
  validateImageUrl(params.imageUrl)
  const post = await findPostByIdRaw(params.postId)
  if (!post || post.deletedAt) {
    throw Object.assign(new Error('게시글을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  const updated = await updatePost(params.postId, {
    title: params.title,
    content: params.content,
    imageUrl: params.imageUrl,
    category: params.category,
  })
  return toDto(updated)
}

export async function deletePostByAdmin(params: { postId: string }): Promise<void> {
  const post = await findPostByIdRaw(params.postId)
  if (!post || post.deletedAt) {
    throw Object.assign(new Error('게시글을 찾을 수 없습니다.'), { statusCode: 404 })
  }
  await softDeletePost(params.postId)
}

export async function issueAdminImageUploadUrl(params: {
  adminId: string
  contentType: string
  contentLength: number
}) {
  return generateCommunityImagePresignedUrl({
    authorType: 'admin',
    authorId: params.adminId,
    contentType: params.contentType,
    contentLength: params.contentLength,
  })
}

export async function listPostsForAdmin(params: {
  page: number
  category?: 'notice' | 'free'
}): Promise<{
  items: CommunityPostDto[]
  total: number
  page: number
  pageSize: number
}> {
  const { items, total } = await findPostsForPublic({
    page: params.page,
    pageSize: PAGE_SIZE,
    category: params.category,
  })
  return {
    items: items.map(toDto),
    total,
    page: params.page,
    pageSize: PAGE_SIZE,
  }
}
