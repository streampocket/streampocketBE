// 직원(staff) 관리자 페이지 권한 키 — 사장이 직원 계정별 체크박스로 부여·회수한다.
// fe(streampocket/constants/adminPermissions.ts)와 키·순서가 같아야 한다.
// 키를 추가해도 DB 마이그레이션은 필요 없다 (Admin.permissions는 문자열 배열).
export const ADMIN_PERMISSION_KEYS = [
  'dashboard',
  'orders',
  'products',
  'accounts',
  'reviewCodes',
  'revenue',
  'users',
  'parties',
  'drama',
  'applications',
  'reviews',
  'otp',
  'community',
  'gcoinProducts',
  'gcoinOrders',
  'visits',
  'alimtalk',
] as const // 단언 사유: 배열 요소를 리터럴 유니온 타입으로 고정하기 위한 const assertion

export type AdminPermission = (typeof ADMIN_PERMISSION_KEYS)[number]

export function isAdminPermission(value: string): value is AdminPermission {
  return ADMIN_PERMISSION_KEYS.some((key) => key === value)
}
