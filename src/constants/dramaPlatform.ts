// 파티명 → 드라마 계정 메모 헤더의 platform 약칭 매핑.
//
// 파티명(OwnProduct.name)은 관리자가 자유 입력하는 값이 아니라 fe/constants/ottImages.ts의
// 고정 7종에서 이미지를 눌러 채워진다. 값 집합이 닫혀 있어 상수 매핑이 안정적이다.
// 반면 DramaAccount.platform은 마스터 테이블 없는 자유 문자열이라(schema.prisma:823-824)
// 파티명과 문자열이 같지 않다 — "비글루" 파티의 계정은 "비글"로 적혀 있다.
//
// 값이 배열인 이유: 같은 플랫폼을 두 가지로 적어둔 계정이 섞여 있어도 모두 잡기 위함
// (예: '비글'과 '비글루'가 함께 쓰인 경우 ['비글', '비글루']).
// 새 OTT를 추가할 때는 fe의 OTT_IMAGES와 이곳을 함께 갱신한다.
export const PARTY_TO_DRAMA_PLATFORM: Record<string, readonly string[]> = {
  '드라마 박스': ['드박'],
  '드라마 웨이브': ['드웨'],
  비글루: ['비글'],
  릴숏: ['릴숏'],
  넷숏: ['넷숏'],
  숏맥스: ['숏맥스'],
  플릭릴스: ['플릭'],
}

/** 파티명에 대응하는 계정 platform 약칭 목록. 매핑이 없으면 빈 배열 = 자동 배정 대상 아님 */
export function resolveDramaPlatforms(partyName: string): readonly string[] {
  return PARTY_TO_DRAMA_PLATFORM[partyName.trim()] ?? []
}
