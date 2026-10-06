// OTTALL 리뷰 본문 최소 글자 수 — 공백(띄어쓰기·줄바꿈 등)을 제외하고 센다.
// fe(constants/app.ts의 REVIEW_CONTENT_MIN_LENGTH)와 같은 값이어야 한다. 변경 시 양쪽 함께 수정.
export const REVIEW_CONTENT_MIN_LENGTH = 5

// 공백을 모두 빼고 코드포인트 단위로 센다 — `.length`(UTF-16)는 이모지를 2자로 세서
// '👍👍👍'가 6자로 통과하므로 펼쳐서 센다. 한글 완성형은 1자. fe도 같은 식을 쓴다.
export function countReviewContentChars(text: string): number {
  return [...text.replace(/\s/g, '')].length
}
