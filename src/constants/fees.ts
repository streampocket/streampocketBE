// 네이버 스마트스토어 수수료율 — 무조건 6.63% 고정
// 매출·정산금·순이익 계산에서 단일 출처로 사용한다. 변경 시 이 값만 수정.
export const NAVER_FEE_RATE = 0.0663

// OTTALL 파티(공동구매) 신청 수수료 — 가격과 무관하게 무조건 300원 정액 고정
// 파티 신청 시 totalAmount = price + 이 값. 변경 시 이 값만 수정.
export const PARTY_APPLICATION_FEE = 300
