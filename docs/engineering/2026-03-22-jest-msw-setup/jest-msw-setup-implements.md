# Jest MSW Setup Fix

## 배경

- 현재 Jest 기본 setup이 모든 테스트 실행 전에 MSW 서버를 전역 초기화한다.
- 이 저장소는 jsdom 기반 테스트, `@jest-environment node` 테스트, Playwright e2e 테스트가 함께 존재한다.
- 하지만 MSW는 실제로 일부 functional 테스트에서만 필요하다.

## 문제 정의

- 전역 setup에서 `msw/node`를 import하면 jsdom 테스트는 `Response is not defined`로 실패할 수 있다.
- 같은 경로에서 MSW v2의 ESM dependency가 로드되면서 node 환경 테스트는 Jest transform 설정 부족으로 `Unexpected token 'export'`로 실패할 수 있다.
- Jest 기본 매칭이 `tests/e2e/*.spec.ts`까지 포함해 Playwright 스펙도 잘못 수집한다.

## 목표

- 기본 Jest 실행에서 MSW를 제거해 unit test와 node test를 안정화한다.
- 현재 functional test는 로컬 `fetch` mock으로 전환해 외부 mocking 런타임 의존을 제거한다.
- Jest가 Playwright e2e 스펙을 수집하지 않도록 분리한다.
- 변경은 테스트 설정 파일과 테스트 코드에만 한정해 `yarn dev`와 `next build` 동작에 영향을 주지 않는다.

## 비목표

- 앱 런타임 fetch 경로, Next API route, middleware 동작은 이번 작업에서 변경하지 않는다.
- Playwright 설정 자체를 바꾸지 않는다.
- MSW를 브라우저 개발환경에 주입하지 않는다.

## 구현 범위

### 1. Jest setup 정리

- `jest.setup.ts`에는 `@testing-library/jest-dom`와 테스트용 env 기본값만 남긴다.
- 전역 setup에서는 MSW import를 제거한다.

### 2. 기본 Jest 설정 정리

- 기본 `jest.config.ts`는 functional test와 `tests/e2e`를 제외한다.
- 기본 unit/node 테스트는 MSW import 없이 실행한다.

### 3. Functional Jest 설정 추가

- `jest.functional.config.ts`를 추가한다.
- 이 설정은 functional test만 대상으로 삼고, `testEnvironment`는 `node`를 사용한다.
- 현재 functional test는 Node 20의 fetch/Response 전역을 활용해 로컬 fetch mock으로 검증한다.

### 4. 스크립트 정리

- `test:unit`, `test:functional`, `test:watch`는 각각 명시적 Jest config를 사용한다.
- 패턴 인자 의존을 줄여 테스트 대상 분리를 설정 파일에 고정한다.

## 성공 기준

- `yarn test:unit`이 MSW 초기화 오류 없이 실행된다.
- `yarn test:functional`이 MSW 초기화 오류 없이 실행된다.
- `npx jest --listTests --config jest.config.ts`에 `tests/e2e` 경로가 포함되지 않는다.
- 변경이 앱 런타임 코드에 영향을 주지 않는다.

## 리스크 및 대응

- 앞으로 API mocking 범위가 넓어지면 단순 fetch mock만으로는 유지보수가 어려울 수 있다.
  - 대응: 그 시점에 MSW를 다시 도입하되, 전역 setup이 아니라 전용 Jest project 또는 전용 테스트 셋에서만 격리 적용한다.
- functional test가 DOM API를 요구할 수 있다.
  - 대응: 그런 테스트가 생기면 jsdom 전용 functional config를 별도로 분리한다.
