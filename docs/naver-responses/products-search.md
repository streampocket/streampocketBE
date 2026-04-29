# 네이버 커머스 API — 상품 목록 조회 응답 구조

**엔드포인트**: `POST /v1/products/search`
**호출 위치**: [be/src/services/platform/naverOrderSource.ts](../../src/services/platform/naverOrderSource.ts) `fetchNaverProductsPage()`
**최종 확인일**: 2026-04-29

---

## 응답 샘플 (실제 운영 데이터, 2026-04-29 수집)

```json
{
  "contents": [
    {
      "originProductNo": 13278540332,
      "channelProducts": [
        {
          "originProductNo": 13278540332,
          "channelProductNo": 13337252556,
          "channelServiceType": "STOREFARM",
          "categoryId": "50001735",
          "name": "steam game test AA",
          "statusType": "SALE",
          "channelProductDisplayStatusType": "ON",
          "salePrice": 30000,
          "discountedPrice": 10,
          "mobileDiscountedPrice": 10,
          "stockQuantity": 9,
          "knowledgeShoppingProductRegistration": false,
          "deliveryAttributeType": "NORMAL",
          "deliveryFee": 0,
          "returnFee": 0,
          "exchangeFee": 0,
          "managerPurchasePoint": 1,
          "wholeCategoryName": "디지털/가전>게임기/타이틀>PC게임",
          "wholeCategoryId": "50000003>50000088>50001735",
          "representativeImage": {
            "url": "https://shop-phinf.pstatic.net/..."
          },
          "sellerTags": [],
          "regDate": "2026-04-01T16:31:02.064+09:00",
          "modifiedDate": "2026-04-01T16:31:02.064+09:00"
        }
      ]
    }
  ],
  "page": 1,
  "size": 100,
  "totalElements": 2,
  "totalPages": 1,
  "sort": {
    "sorted": true,
    "fields": [
      { "name": "regDate", "direction": "DESC" },
      { "name": "productNo", "direction": "DESC" }
    ]
  },
  "first": true,
  "last": true
}
```

---

## 가격 관련 필드

| 필드 | 의미 | 비고 |
| --- | --- | --- |
| `salePrice` | 정가 (할인 적용 전 판매가) | 사장님이 상품 등록 시 설정한 가격 |
| `discountedPrice` | PC 웹 할인가 | 할인 미설정 시 응답에 포함되는지 확인 필요 (현재 샘플은 모두 할인 설정된 상태) |
| `mobileDiscountedPrice` | 모바일 할인가 | PC와 별도 설정 가능. 보통 동일하게 설정함 |

### 할인 미설정 케이스에 대한 가정

현재 샘플은 두 상품 모두 할인이 설정되어 있어 `discountedPrice` 필드의 누락 케이스를 직접 확인하지 못함.
구현은 다음 두 경우 모두 "할인 없음"으로 간주하도록 처리:

1. `discountedPrice` 필드 자체가 응답에 없음 (undefined)
2. `discountedPrice === salePrice`

→ 정규화 규칙:
```ts
discountedPricePc = (discountedPrice == null || discountedPrice === salePrice)
  ? null
  : discountedPrice
// mobileDiscountedPrice도 동일 규칙
```

---

## 페이징 관련 필드

- `totalElements`: 전체 상품 수
- `totalPages`: 전체 페이지 수
- `page`, `size`: 현재 페이지/페이지당 크기
- `first`, `last`: 첫/마지막 페이지 여부

---

## 변경 이력

- 2026-04-29: 최초 수집. `salePrice`/`discountedPrice`/`mobileDiscountedPrice` 필드 식별
