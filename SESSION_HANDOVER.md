# Session Handover

## 날짜: 2026-04-14

## 완료

### 디자인 시스템 전환
- v6 Notion warm wireframe → Stitch M3 warm earth 디자인 시스템으로 교체
- `globals.css` 토큰: `#fef9ef` canvas, `#363225` ink, `#006789` tertiary, 32px card radii, warm soft shadow
- Material Symbols 대신 lucide-react 사용 (프로젝트 기본 아이콘 시스템 유지)

### Notion API 통합 (핵심)
- `src/lib/notion.ts`의 `queryDatabase`가 SDK v5의 `dataSources.query`를 쓰면 잘못된 엔드포인트를 호출 → REST API 직접 호출로 전환 (`fetch('https://api.notion.com/v1/databases/{id}/query')`)
- 프로퍼티명 매핑 수정: Tasks의 title은 "Entry name", Finance의 title은 "Entry", 체크박스는 "Completed"
- Integration에 DB 공유 안 된 경우 graceful fallback to mock data (fallback=true 플래그)
- 7개 Insights 서브 DB ID 추가, Parent Task DB ID 추가
- 접근 금지 DB `270003c7f7be80f5a586c9c2ac75769d` 코드에 절대 포함시키지 않음

### 전체 CRUD 구현
- `GET/POST /api/tasks` — 목록 조회, 생성, 체크박스 토글
- `GET /api/finance /insights /works` — 조회 (insights는 `?dbId=` 파라미터로 서브 DB 쿼리 지원)
- `GET /api/search` — Notion 검색 API 래핑
- `POST /api/pages` — 새 페이지 생성
- `GET/PATCH/DELETE /api/pages/[id]` — 개별 페이지 CRUD
- `GET/PATCH /api/pages/[id]/blocks` — 본문 블록 읽기/쓰기
- `GET /api/metrics/weekly` — 이번 주/지난 주 완료 수, 7일 바 차트, 긴급/미완료 카운트

### 페이지 구조
- `/` (home) — Stitch dashboard, 실제 Notion 데이터 연동
- `/search` — 디바운스 검색 + localStorage 최근 검색어 + URL `?q=` 파라미터
- `/tasks` (Widgets) — 위젯 갤러리
- `/finance` (Profile) — 프로필/연결 상태
- `/db/[key]` — 범용 DB 뷰 (tasks/finance/insights/works)
  - Insights는 7개 서브 폴더 그리드 (`?sub=ai` 등으로 개별 DB 쿼리)
- `/edit/[id]` — 단일 페이지 편집 (제목/상태/날짜/태그/본문/삭제)

### 홈 위젯 모두 실데이터 매핑
- Calendar: 오늘 날짜 + 다음 이벤트 제목 + 오늘 경과율 프로그레스
- Pending: 3일 이내 마감 긴급 카운트 (색상 단계별 tertiary→orange→red)
- Immediate Actions: `[오늘][이번 주][지연][완료]` 필터, 완료율 동적 계산
- Insight cards: `lastEditedAt` 내림차순, 카테고리별 그라데이션
- Focus Time: 주간 완료율 변화 + 7일 바 차트
- Time: 오늘 완료 태스크 수
- Focus Areas: 각 타일 카운트 배지 (pending/monthly expense/insights count/active works)
- CTA: 시간대별 컨텍스트 메시지
- FAB: CreateSheet 4탭 (Quick Task / Memo / Project / 지출)

### 인프라
- UI Inspector MCP 연결했으나 세션 중 disconnect됨 (재시작 필요)
- Google Stitch MCP는 CLI에서 `claude mcp add`로 추가 (세션 내 실행 불가, Claude Code 재시작 필요)

## 미완료

### Finance DB
- 타임라인 DB에 데이터가 1건만 있음 ("Grok xAI 구독")
- 예정 수입/지출 DB (`15007d59-...`)는 아직 Integration에 공유 안 됨 → 공유 시 자동으로 finance에 합산됨

### Widgets 탭 재검토
- 현재 `/tasks` 경로가 Widgets 갤러리인데 사용 빈도 낮음
- 검토 옵션:
  - (A) Today 전용 뷰로 변경
  - (B) 실질적인 위젯 관리(추가/제거/재배치) 페이지로 유지
- **다음 단계**: 사용자에게 A/B 중 선택 확인

### 롱프레스 위젯 편집 모드 (v4 지글 모드)
- v4 와이어프레임에 있던 롱프레스 → 지글 모드 기능은 v2 Stitch 템플릿에서 제거됨
- Focus Area 타일에 롱프레스 퀵 액션 메뉴 제안했으나 미구현
- **다음 단계**: framer-motion 활용해서 구현

### PWA manifest
- `public/manifest.json` 생성되었지만 실제 PWA 동작 검증 안 됨
- **다음 단계**: 아이콘 파일 (`/icon-192.png`, `/icon-512.png`) 생성 필요

### Playwright E2E 테스트
- 40개 중 39개 통과
- 실패 1건: 체크박스 토글 후 CSS class 전파 타이밍 (UI는 정상 동작, 테스트 타이밍 이슈)
- **다음 단계**: `wait_for_selector('.task-check.checked')` 로 교체

## 에러/학습

### Notion SDK v5의 함정
- `@notionhq/client` v5.17에서 `databases.query`는 deprecate되고 `dataSources.query`가 추가됐으나, **이 메서드는 database ID로 쿼리하면 `object_not_found` 반환**함
- 해결: REST API를 `fetch`로 직접 호출. `POST /v1/databases/{id}/query`
- 교훈: SDK 타입이 존재한다고 해서 실제 동작하는 건 아님. 공식 REST 문서가 더 신뢰할 수 있음

### Next.js dev 서버 단일 인스턴스 제약
- 같은 디렉토리에서 `next dev`는 두 개 이상 띄울 수 없음 (다른 포트라도 거부됨)
- `.next/dev/server/` 캐시 손상 시 `rm -rf .next` 후 재시작 필요

### env.local 반영
- dev 서버 실행 중에 `.env.local` 수정해도 반영 안 됨. 서버 재시작 필수
- 재시작 시 `.next` 폴더 제거하지 않으면 이전 환경변수로 빌드된 번들이 남아있을 수 있음

### scroll-snap + padding
- `.rail { padding-left: 6px; scroll-snap-type: x proximity }` 조합에서 브라우저가 로드 시 자동으로 `scrollLeft = 6`으로 스크롤해 padding을 먹음
- 해결: `scroll-padding-left` 속성으로 snap 시작점을 명시적으로 지정

### Notion DB 프로퍼티명이 워크스페이스마다 다름
- Beyond_Tasks의 title은 "Entry name" (기본 "Name" 아님)
- 타임라인의 title은 "Entry" (끝에 name 없음)
- 체크박스는 "Completed" (영어로 "Done"이 아님)
- 교훈: 프로퍼티명은 하드코딩 대신 다중 후보 배열로 매칭 (`getPropertyValueMulti`)

### Replace_all 주의
- 정규식 기반 일괄 치환 시 CSS 단일 rule과 다중 rule을 동시에 매칭하면 의도치 않은 삭제 발생
- 예: `background: var(--n-X-bg); color: var(--n-X-tx);` → `color: var(--n-X-tx);` 치환이 n-tag/n-status의 background도 삭제
- 교훈: 치환 전후 grep으로 영향 범위 확인

## 다음 세션 시작 시

1. **Notion DB 공유 확인**: 예정 수입/지출 DB (`15007d59-...`)가 Integration에 공유되었는지 `curl` 테스트
2. **Widgets 탭 방향성 결정**: 사용자에게 (A) Today 뷰 / (B) 위젯 관리 중 선택 요청
3. **롱프레스 지글 모드 재구현**: framer-motion으로 Focus Area 타일에 롱프레스 인터랙션 추가
4. **PWA 아이콘 생성**: `public/icon-192.png`, `public/icon-512.png` 생성 (Stitch 컬러 테마 적용)
5. **Playwright 체크박스 테스트 수정**: `wait_for_selector` 기반으로 전환
6. **dev 서버 위치**: 현재 `localhost:3003`에서 실행 중 (3000은 다른 앱이 사용)
