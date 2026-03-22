# Stock Management Implements

## 문서 목적

이 문서는 [prd.md](/Users/hong-yechan/asset_management/docs/feature/stock-management/prd.md)의 1차 범위를 구현하기 위한 엔지니어 문서다.
초점은 `미국주식/미국 ETF 수동 포트폴리오 관리`를 현재 코드베이스 안에 어떻게 안전하게 넣을지에 둔다.

## 현재 코드베이스 관찰

- `stocks` 는 이미 [types.ts](/Users/hong-yechan/asset_management/src/entities/assets/api/types.ts)의 `UserPortfolio`와 `AssetItem`에 포함되어 있다.
- `/assets` 는 [page.tsx](/Users/hong-yechan/asset_management/src/app/assets/page.tsx)에서 `getAsset`, `getCurrency`, `getCoins`, `getAssetCategories`를 읽어 [client.tsx](/Users/hong-yechan/asset_management/src/app/assets/client.tsx)에 전달한다.
- 현재 [assetSection.tsx](/Users/hong-yechan/asset_management/src/features/assets/ui/assetSection.tsx)와 [addAsset.tsx](/Users/hong-yechan/asset_management/src/features/assets/ui/modal/addAsset.tsx)는 `stocks`를 토스트로 막고 있어 주식 자산이 정식 기능으로 승격되지 않은 상태다.
- [editAsset.tsx](/Users/hong-yechan/asset_management/src/features/assets/ui/modal/editAsset.tsx)는 `crypto` 중심으로 평균단가 편집을 지원하지만, 구조 자체는 `stocks`에도 확장 가능하다.
- [ProfitLossDisplay.tsx](/Users/hong-yechan/asset_management/src/features/assets/ui/components/ProfitLossDisplay.tsx)는 이미 `USD` 금액 병기를 지원하므로 주식 손익 표시에도 재사용할 수 있다.
- 코인/환율 동기화는 [sync.ts](/Users/hong-yechan/asset_management/src/server/market-sync/sync.ts) 패턴이 있으나, 주식은 아직 별도 검색/시세/provider abstraction이 없다.
- 현재 자산 변경은 `add_asset`, `remove_asset`, `update_average_price` 같은 범용 RPC에 의존하는데, 이 계약은 `BUY`, `SELL`, `DIVIDEND`, `ADJUST_COST_BASIS` 같은 주식 이벤트 원장을 수용하기 어렵다.
- 따라서 이번 구현에서 `stocks`는 기존 범용 자산 mutation에 편입하지 않고, 별도 stock domain backend 로 분리한다.

## 구현 목표

1. `stocks`를 현재 자산 UI의 정식 타입으로 승격한다.
2. 외부 provider는 종목 검색과 시세 조회만 담당하게 하고, 사용자 포트폴리오 원장은 우리 DB가 진실 원본이 되게 한다.
3. 서버 집계층이 `currentPrice`, `value`, `profitLoss`, `quoteStatus`, `lastUpdated`를 계산해서 프런트에 전달한다.
4. 1차에서는 `/assets` 내 `추가/편집 모달 + 목록 반영 + stale 배너 + USD/KRW 손익 표시`까지 구현한다.

## 핵심 설계 원칙

### 1. 외부 API는 보조, 내부 원장은 기준

- 외부 API는 `종목 메타데이터`와 `최신 시세`를 가져오는 용도로만 사용한다.
- 보유 수량, 매수 원가, 배당, 매도, 예수금, USD 현금은 모두 내부 거래 이벤트로 관리한다.
- 계좌 자동 연동은 1차 범위가 아니다.

### 2. provider abstraction을 먼저 둔다

- 특정 증권사 API에 도메인 로직을 직접 묶지 않는다.
- 검색과 시세는 추상화 뒤에 숨긴다.
- 나무증권은 후보 provider로 두되, 검증 전까지는 구현 문서에서 `candidate provider`로 취급한다.

### 3. 계산은 서버, 표시와 입력은 프런트

- 평균단가, 일부 매도 후 잔량, 배당 반영, USD 평균 환율은 서버가 계산한다.
- 프런트는 토글, 입력 보조, stale 상태 표시, 목록 반영에 집중한다.

### 4. stale는 soft fail로 처리한다

- 최신 시세 실패 시 마지막 성공값을 유지한다.
- 읽기 자체를 실패시키지 않고 `stale 상태 메타데이터`를 내려준다.
- 프런트는 이를 바탕으로 노란 배너와 보조 상태를 노출한다.

### 5. 주식은 별도 backend 도메인으로 구현한다

- `cash`, `crypto`는 기존 범용 자산 RPC를 유지할 수 있다.
- `stocks`는 별도 스키마, 별도 mutation, 별도 read model 로 구현한다.
- 프런트는 stock 전용 mutation 과 stock 전용 조회 계약에 연결되고, 범용 `add_asset`를 주식에 재사용하지 않는다.

### 6. 임시 adapter 로 generic RPC를 연장하지 않는다

- `add_asset`, `remove_asset`, `update_average_price`에 stock 전용 인자를 덧붙여 1차 기능을 맞추는 방식은 사용하지 않는다.
- hidden field, 클라이언트 계산값, 임시 payload adapter는 UI 편의 계층으로만 취급하고 서버 진실 원본을 대체하지 않는다.
- 구현 순서는 `backend schema/RPC/read model`이 먼저이고, 프런트 연결은 그 다음이다.

## 이번 단계 백엔드 산출물

이번 단계에서 실제로 만들어야 하는 서버 측 산출물:

- stock 전용 migration
  - `stock_symbols`
  - `stock_quotes`
  - `portfolio_transactions`
  - `portfolio_positions`
  - `cash_positions`
- stock 전용 RPC / query
  - `search_stock_symbols`
  - `create_stock_buy_transaction`
  - `create_stock_sell_transaction`
  - `adjust_stock_cost_basis`
  - `get_stock_portfolio`
  - `refresh_stock_quotes_if_stale`
- `/assets` 통합용 read model
  - 기존 `user_asset`를 확장하거나
  - stock read model 을 별도 조회 후 앱 서버에서 병합

선택 원칙:

- 1차는 구현 단순성과 추적 가능성을 우선한다.
- 주식 read 경로는 generic asset read 경로와 분리돼도 괜찮지만, 저장 경로는 반드시 stock domain 으로 분리한다.
- 프런트 임시 우회보다 migration 과 RPC 계약 확정을 우선한다.

## 이번 단계 구현 데이터 모델

### 종목 메타데이터

```sql
stock_symbols (
  symbol text primary key,
  name text not null,
  market text not null,
  asset_kind text not null, -- US_STOCK | US_ETF
  currency text not null,   -- USD
  exchange text,
  provider_symbol text,
  provider_name text,
  is_active boolean default true,
  created_at timestamptz default timezone('utc', now())
)
```

### 최신 시세

```sql
stock_quotes (
  symbol text not null references stock_symbols(symbol),
  price numeric not null,
  currency text not null,
  price_krw numeric,
  fx_rate_snapshot numeric,
  fetched_at timestamptz not null,
  stale_at timestamptz,
  provider_name text not null,
  provider_status text not null,
  created_at timestamptz default timezone('utc', now()),
  primary key (symbol, fetched_at)
)
```

### 거래 원장

```sql
portfolio_transactions (
  id uuid primary key,
  user_id uuid not null,
  asset_type text not null, -- stocks | cash
  asset_sub_type text not null,
  symbol text,
  event_type text not null,
  quantity numeric,
  unit_price numeric,
  total_amount numeric,
  currency text not null,
  event_date date not null,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz default timezone('utc', now())
)
```

권장 `event_type`:

- `BUY`
- `SELL`
- `DIVIDEND`
- `CASH_DEPOSIT`
- `CASH_WITHDRAW`
- `FX_BUY_USD`
- `FX_SELL_USD`
- `STOCK_DEPOSIT`
- `ADJUST_POSITION`
- `ADJUST_COST_BASIS`

### 포지션 / 현금 집계

```sql
portfolio_positions (
  user_id uuid not null,
  symbol text not null,
  quantity numeric not null,
  avg_unit_cost_usd numeric not null,
  cost_basis_usd numeric not null,
  last_updated_at timestamptz not null,
  primary key (user_id, symbol)
)
```

```sql
cash_positions (
  user_id uuid not null,
  currency text not null,
  balance numeric not null,
  avg_fx_rate_krw_per_usd numeric,
  cost_basis_krw numeric,
  last_updated_at timestamptz not null,
  primary key (user_id, currency)
)
```

### 배당 기록

- 별도 `dividend_events` 테이블을 두거나 `portfolio_transactions`의 `DIVIDEND`를 뷰로 노출한다.
- 필수 필드:
  - `source_symbol`
  - `amount_usd`
  - `event_date`
  - `fx_rate_at_received` 선택 저장

## stock domain API / RPC 계약

이번 단계 구현 기준:

- `search_stock_symbols(query text)`
  - 종목 검색 결과 반환
- `create_stock_buy_transaction(...)`
  - 수동 매수 이벤트 기록
- `create_stock_sell_transaction(...)`
  - 일부 매도 / 전체 매도 이벤트 기록
- `adjust_stock_cost_basis(...)`
  - 평단가 또는 총원가 정정 이벤트 기록
- `get_stock_portfolio(user_id)`
  - 포지션, 평가, 손익, stale 메타데이터를 포함한 read model 반환
- `refresh_stock_quotes_if_stale(symbols text[])`
  - stale 판단 후 quote refresh 시도, 실패 시 마지막 성공 quote fallback

원칙:

- 프런트 add/edit modal 은 stock 전용 mutation 만 호출한다.
- `/assets`는 최종적으로 stock 전용 read model 을 합쳐 렌더링한다.
- 기존 `add_asset`, `remove_asset`, `update_average_price`는 stock 도메인에서 사용하지 않는다.

## `/assets` read model 계약

`get_stock_portfolio(user_id)` 또는 동등한 read query 는 최소한 아래 정보를 반환해야 한다.

- `symbol`
- `name`
- `assetSubType`
- `quantity`
- `avgUnitCostUsd`
- `costBasisUsd`
- `currentPriceUsd`
- `currentPriceKrw`
- `marketValueUsd`
- `marketValueKrw`
- `profitLossUsd`
- `profitLossKrw`
- `profitLossPercent`
- `quoteStatus`
- `isStale`
- `lastUpdated`
- `lastSuccessfulFetchedAt`

통합 원칙:

- `/assets` 화면은 stock read model 을 그대로 쓰거나, 앱 서버에서 기존 cash/crypto 응답과 병합해 단일 뷰 모델로 만든다.
- 프런트는 원가/손익/stale 값을 재계산하지 않고 서버 응답을 표시 중심으로만 소비한다.
- `USD/KRW` 환산, 손익 계산, stale 판단은 서버 책임으로 둔다.

## provider abstraction

### 인터페이스

```ts
type SearchResult = {
  symbol: string;
  name: string;
  assetKind: "US_STOCK" | "US_ETF";
  exchange: string | null;
  providerName: string;
};

type QuoteResult = {
  symbol: string;
  priceUsd: number;
  fetchedAt: string;
  providerName: string;
  providerStatus: "fresh" | "stale" | "failed";
};

interface StockMarketProvider {
  searchSymbols(query: string): Promise<SearchResult[]>;
  getQuotes(symbols: string[]): Promise<QuoteResult[]>;
}
```

### 구현 방향

- `BrokerMarketProvider`
- `NamuhProviderCandidate`
- `KisProvider`
- `FallbackStaticProvider` 또는 `ManualSeedProvider`

구현 문서 기준 판단:

- 1차는 `provider abstraction + verified provider 우선 + namuh candidate`로 간다.
- 검색 provider와 시세 provider는 분리 가능하게 둔다.

## 서버 계산 규칙

### 매수

- `BUY` 이벤트가 들어오면 수량을 증가시킨다.
- 평균단가는 `기존 원가 + 신규 매수원가`를 총수량으로 나눠 계산한다.

### 일부 매도

- 규칙은 `평단 유지 + 보유 수량 감소`다.
- `SELL` 이벤트에 다음 중 하나를 저장하거나 파생 계산 가능하게 한다.
  - `realized_pnl_usd`
  - `realized_pnl_krw`
  - `label_day`
  - `label_month`
  - `label_year`

### 전체 삭제

- 마지막 `SELL` 이후 수량이 0이면 포지션 종료 상태로 본다.

### 수동 정정

- 전체 평단가 또는 총매수금액 수정은 `ADJUST_COST_BASIS` 이벤트로 기록한다.
- 수량 보정은 `ADJUST_POSITION` 이벤트로 기록한다.
- 원장 추적성을 위해 “덮어쓰기”보다 “정정 이벤트 추가”를 우선한다.

### 배당금

- 배당금은 `USD 현금 잔고`에는 포함한다.
- 그러나 `USD 평균 환율 원가` 계산에는 포함하지 않는다.
- 배당금은 `source_symbol`을 반드시 저장한다.

### USD 평균 환율

- 평균 환율은 `FX_BUY_USD` 또는 사용자가 직접 입력한 USD 취득 이벤트만 반영한다.
- 계산식:

```txt
avg_fx_rate = total_krw_cost_for_usd_lots / total_usd_lots
```

- 배당금, 증정, 보정성 USD 유입은 평균 환율 계산에서 제외한다.

표시용 반환 권장 필드:

- `usdCashBalance`
- `usdCashAvgFxRate`
- `usdCashCostBasisKrw`

### 예수금

- 표현은 `stocks` 하위 카테고리로 둔다.
- 저장 구조는 현금 이벤트 축과 유사하게 유지한다.
- 이유는 후속 `예수금을 현금으로 보기` 토글이 들어와도 저장 구조를 바꾸지 않기 위해서다.

## stale / cache / refresh 전략

### 1차 전략

- `on-demand refresh + 마지막 성공값 캐시`
- 강제 cron은 1차 필수 아님

### 권장 흐름

1. `/assets` 진입 시 종목별 stale 여부 판단
2. stale이면 서버에서 refresh 시도
3. 성공 시 최신 quote 저장
4. 실패 시 마지막 성공 quote 반환
5. 응답에 stale 메타데이터 포함

권장 응답 메타데이터:

- `quoteStatus: "fresh" | "stale" | "failed"`
- `lastUpdated`
- `isStale`
- `staleReason`
- `lastSuccessfulFetchedAt`

## 프런트 연동 방향

### 타입 확장

[types.ts](/Users/hong-yechan/asset_management/src/entities/assets/api/types.ts)를 아래 방향으로 확장한다.

- `AssetItem`
  - `lastUpdated?: string | null`
  - `quoteStatus?: "fresh" | "stale" | "failed"`
  - `profitLoss?: { percent: number; amountKrw: number; amountUsd: number }`
  - `assetSubType?: "US_STOCK" | "US_ETF" | "USD_CASH" | "DIVIDEND" | "DEPOSIT"`
- `UserCategory`
  - `averagePriceUsd?: number`
  - `averagePriceKrw?: number`
  - `totalCostUsd?: number`
  - `totalCostKrw?: number`
  - `realizedLabel?: string`

### Add modal

[addAsset.tsx](/Users/hong-yechan/asset_management/src/features/assets/ui/modal/addAsset.tsx)

- `stocks` 토스트 차단 제거
- 자유 텍스트 심볼 입력 대신 검색 결과 선택 기반으로 전환
- 입력 단계
  - 자산 subtype 선택
  - 종목 검색 또는 현금/예수금 타입 선택
  - 수량/금액 입력
  - 날짜 입력
  - 평균단가 입력 방식 토글
- [AveragePriceInput.tsx](/Users/hong-yechan/asset_management/src/features/assets/ui/components/AveragePriceInput.tsx)는 코인 전용이 아니라 주식에도 재사용 가능하게 일반화

### Edit modal

[editAsset.tsx](/Users/hong-yechan/asset_management/src/features/assets/ui/modal/editAsset.tsx)

- `ADD/REMOVE/DELETE/EDIT` 구조는 유지
- `stocks`에도 전체 열기
- `ADD`
  - 추가 수량
  - 추가 매수일
  - 추가 단가 또는 총액
- `REMOVE`
  - 일부 매도 수량
  - 매도일
  - 매도가
- `EDIT`
  - 평균단가 또는 총매수금액 수정
  - USD 현금은 평균 환율 수정 UI 추가 가능

### 목록 반영

[assetSection.tsx](/Users/hong-yechan/asset_management/src/features/assets/ui/assetSection.tsx)

- `stocks` 더하기 버튼 차단 제거
- stocks 섹션 상단에 stale 배너 조건부 노출
- 카테고리 펼침 영역에 보유수량, 평균단가, 평가금액, 마지막 갱신 시각 추가

[listButton.tsx](/Users/hong-yechan/asset_management/src/features/assets/ui/listButton.tsx)

- 현재 crypto 중심 손익 표시를 stocks에도 확장
- 메인 행 표시 권장:
  - 종목명
  - `1주 ≈ $xxx / ₩yyy`
  - 총 평가금액 `₩ + $`
  - 손익률 / 손익금액 `USD + KRW`

### stale banner

- stocks 섹션에 stale quote가 하나라도 있으면 노란 배너 노출
- 문구 예시:

```txt
최신 시세를 불러오지 못해 마지막으로 저장된 가격을 표시하고 있습니다.
```

- 필요 시 개별 자산 행에는 `stale` 뱃지를 보조 표시한다.

## 기존 API / 서버 액션 연결

- [handleAddAsset.ts](/Users/hong-yechan/asset_management/src/features/assets/model/functions/handleAddAsset.ts)는 `cash`, `crypto` 범용 action 으로 남긴다.
- `stocks`는 별도 action 으로 분리한다.
  - `handleCreateStockBuyTransaction`
  - `handleCreateStockSellTransaction`
  - `handleAdjustStockCostBasis`
- stock action 은 stock 전용 RPC 를 호출하고, 저장 후 `revalidatePath("/assets")`를 유지한다.
- 1차에서는 낙관적 업데이트보다 서버 재조회가 안전하다.
- `AddAssetModal`과 `EditAssetModal`의 stock 경로는 generic `addAsset.ts` API adapter 를 호출하지 않는다.
- 서버 액션 이름은 바뀔 수 있지만, contract 경계는 `cash/crypto generic` 와 `stocks dedicated` 로 유지한다.

## 구현 순서

1. 주식/거래/현금/배당 스키마 설계 확정
2. migration 작성
3. stock 전용 RPC / query 작성
4. 포지션/현금 집계 및 stock read model 구현
5. provider 인터페이스와 검색/시세 서비스 정의
6. quote refresh + stale fallback 로직 구현
7. `/assets` 읽기 경로에 stock read model 병합
8. add/edit modal과 stocks 목록을 stock 전용 backend 에 연결
9. stale 배너와 USD/KRW 손익 표시 연결
10. 테스트 추가

## 검증 계획

1. provider abstraction 단위 테스트
2. stock RPC / query 테스트
  - buy transaction 저장
  - sell transaction 저장
  - adjust cost basis 저장
3. 포지션 계산 테스트
  - 추가 매수 후 평균단가 갱신
  - 일부 매도 후 평단 유지
  - 전체 삭제 후 포지션 종료
4. 배당금 반영 테스트
  - USD balance 증가
  - USD avg fx rate 불변
5. stale fallback 테스트
  - refresh 실패 시 마지막 성공 quote 유지
  - stale 메타데이터 반환
6. `/assets` UI 테스트
  - stocks 추가 가능
  - 목록 반영
  - 손익 표시
  - stale 배너 표시
7. backend contract 회귀 테스트
  - stock action 이 generic `add_asset`를 호출하지 않음
  - stock add/edit/read 경로가 전용 RPC 계약만 사용함

## 운영 고려사항

- 환경변수는 provider별 namespace로 분리한다.
  - `STOCK_PROVIDER`
  - `KIS_*`
  - `NAMUH_*`
- 구조화 로그 필드 권장:
  - `provider`
  - `symbol`
  - `request_type`
  - `success`
  - `latency_ms`
  - `stale_served`
- 운영 폴백 우선순위:
  1. 검증된 provider quote
  2. 마지막 성공 quote
  3. 종목 메타데이터만 있는 상태
  4. 시세 미지원 상태

## 리스크와 대응

- 나무증권 공개 API 사용 가능성이 불확실하다.
  - 대응: provider abstraction + verified provider 우선
- 검색과 시세를 같은 provider에 강하게 묶으면 장애 범위가 커진다.
  - 대응: search provider와 quote provider 분리 가능 구조
- stale 상태를 값과 분리하지 않으면 사용자가 마지막 성공값을 최신값으로 오해할 수 있다.
  - 대응: 상단 노란 배너 + 자산별 stale 메타데이터
- 초기 구현에서 주식 UI를 별도 예외로 두면 기존 자산 UI와 다시 분리된다.
  - 대응: 기존 asset UI 안에서 `stocks`를 정식 타입으로 승격

## 2차 이후 확장

- 국내주식 / 국내 ETF
- 자산 상세 화면
- 거래 타임라인
- realised P/L 리포트
- 예수금/현금 토글
- 배당 분석 기능
- 증권사 계좌 연동 검토
