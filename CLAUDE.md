@AGENTS.md

# CRITICAL: 이중 앱 구조 (에이전트 필독)

## 실제 사용자 앱 = `public/design/` (Babel SPA)
- **UI 수정**: `public/design/src/app-screens-{1,2,3}.jsx`, `app-shared.jsx`
- **CSS 수정**: `public/design/styles/notion-ios.css`
- **앱 셸**: `public/design/Notion Mobile App.html`
- **DB ID**: `app-shared.jsx`의 `NM_OWNER_DB_IDS` + `app-screens-2.jsx`의 `DB_ID_BY_KEY_2` + `app-screens-3.jsx`의 `DB_ID_BY_KEY`
- **빌드**: Babel 브라우저 트랜스파일. `npm run build`로 검출 불가

## `src/` = API route 서버 로직만 프로덕션 기여
- `src/app/api/` — Notion API 프록시 (유일하게 프로덕션 사용)
- `src/components/` — **미사용** (public/design/에서 import 안 함)
- `src/app/(tabs)/` — **미사용** (rewrite로 우회됨)
- `src/app/globals.css` — **미사용** (실제 앱은 notion-ios.css)
- `src/app/layout.tsx` — **미사용** (/app은 rewrite)
- `src/lib/db-ids.ts` — API route 서버 전용. 프론트엔드와 동기화 안 됨

## 검증 규칙
- `npm run build` 통과 = UI 검증 불가 (src/ 코드만 컴파일)
- UI 변경 후 반드시 브라우저에서 `/app` 접속하여 직접 확인
- 확인 없이 "완료" 선언 절대 금지

---

# Notion-to-Lean: 모바일 위젯 대시보드

## 프로젝트 개요
Notion 워크스페이스를 모바일 친화적 위젯 대시보드로 재구성하는 PWA.
Notion 모바일 앱의 불편한 UI를 대체하여, 사용자가 섹션별로 Notion DB를 연결하고
iOS 홈화면 위젯처럼 커스터마이즈 가능한 인터페이스를 제공한다.

## 핵심 컨셉
- "위젯 빌더" — iOS 홈화면처럼 사용자가 위젯을 추가/삭제/재배치
- Notion API로 실시간 데이터, 별도 프론트엔드로 최적 모바일 UX
- 디자인 DNA: Notion warm minimalism + Apple iOS 터치 패턴 하이브리드

## 실제 아키텍처 (반드시 숙지)

### 앱 엔트리포인트는 `public/design/`이다 (src/ 아님)
- `/app` 경로는 `next.config.ts`의 rewrite로 `public/design/Notion Mobile App.html`을 서빙
- **UI 수정은 반드시 `public/design/` 아래 파일을 대상으로 한다**
- `src/app/`은 API route(`/api/*`)에만 사용된다
- `src/app/layout.tsx`, `src/app/globals.css`는 `/app` 경로에 적용되지 않는다

### 파일 구조
| 경로 | 역할 |
|------|------|
| `public/design/Notion Mobile App.html` | 앱 셸 — viewport/키보드 관리, React 마운트, SW 등록 |
| `public/design/src/app-shared.jsx` | 공유 컴포넌트 (Phone, TabBar, ActionSheet, NavBar) + 세션/연결 관리 (nmRefreshSession, nmLoadCoreDbMap 등) |
| `public/design/src/app-screens-1.jsx` | 홈(HomeScreen), 검색(SearchScreen), 인박스(InboxScreen), 위젯 시스템 |
| `public/design/src/app-screens-2.jsx` | DB 리스트(DbListScreen), 캘린더(CalendarScreen), 페이지 상세(PageScreen) |
| `public/design/src/app-screens-3.jsx` | 이벤트 편집, 설정(SettingsScreen), 프로필, 토큰/DB Picker |
| `public/design/styles/notion-ios.css` | 디자인 토큰, CSS 변수, 공통 스타일 |
| `src/app/api/*/route.ts` | Notion API 프록시 (tasks, finance, insights, works 등) |

### 기술 스택
- Next.js 16+ (API route + 정적 파일 서빙 인프라로 사용)
- `public/design/` — 순수 HTML + React JSX (Babel 런타임 변환)
- @notionhq/client (Notion SDK, 서버 전용)
- lucide-react (벡터 아이콘, 이모지 사용 금지)
- 배포: Vercel (PWA manifest 포함)

## 디자인 시스템
`design-md/` 디렉토리에 참조 DESIGN.md 파일 2개:
- `design-md/notion/DESIGN.md` — Notion 디자인 토큰 (309줄)
- `design-md/apple/DESIGN.md` — Apple iOS 디자인 토큰 (313줄)

### 필수 디자인 규칙 (사용자 디자인 민감도 높음)
- 색상: 순수 회색(#ccc 등) 금지. 반드시 warm neutral (#f6f5f4, #615d59, #a39e98)
- 텍스트: rgba(0,0,0,0.92), 순수 검정(#000) 금지
- 포인트: Notion Blue #0075de (유일한 채도 색)
- 보더: 1px solid rgba(0,0,0,0.08) — whisper weight
- 그림자: multi-layer, 개별 opacity 0.02~0.04 (절대 단일 레이어 하드 그림자 금지)
- 폰트: Inter, negative letter-spacing at headings (-0.6px ~ -1.4px)
- 아이콘: Lucide Icons only. 이모지/이모티콘 절대 금지
- 헤더/탭바: iOS frosted glass (backdrop-filter blur(20px) saturate(180%))
- border-radius: 12px 카드, 9999px pill, 10px 버튼
- 제네릭 AI 디자인 패턴 회피 — 픽셀 단위 품질 추구

## 위젯 시스템 정의

### 사이즈 (iOS 위젯 그리드)
- Small (1x1): 반폭, 정사각 비율
- Medium (2x1): 풀폭, 낮은 높이
- Large (2x2): 풀폭, 높은 높이
- 기본 2열 그리드, Small은 2개 나란히, Medium/Large는 풀폭

### 위젯 타입 7종
1. **숫자 카드** (Small) — 단일 메트릭 (합계, D-day, 카운트)
2. **리스트** (Medium/Large) — 체크박스 + 날짜 세로 목록
3. **카드 슬라이드** (Medium) — 가로 스와이프 카드 리스트 (핵심 패턴)
4. **캘린더** (Large) — 미니 월간 + 이벤트 도트
5. **갤러리** (Medium/Large) — 2~3열 이미지 그리드
6. **프로그레스** (Small) — 원형/바 진행률
7. **퀵 액션** (Small) — 아이콘 + 라벨, 원터치 동작

### 위젯 편집 모드
- 롱프레스 (0.6초) → 지글 모드 (iOS 동일, 전체 위젯 흔들림)
- (-) 버튼으로 삭제, 드래그로 위치 교체
- 위젯 탭 → 설정 반모달 (DB 선택, 뷰 타입, 필터, 사이즈, 컬러)
- (+) 위젯 추가 → 타입 선택 → DB 연결 → 배치

### 터치 인터랙션
- 탭: 아이템 열기
- 스와이프 좌우: 카드 슬라이드
- 롱프레스: 지글 모드
- 드래그: 위젯 위치 교체
- 풀다운: pull-to-refresh
- active: scale(0.97) 피드백

### 위젯 설정 저장
- JSON으로 localStorage + Notion 페이지 백업
- 다른 기기에서도 동일 레이아웃 복원

## 사용자 Notion 워크스페이스 구조
위젯 기본 배치에 참고:

```
Beyondworks (Wiki DB: 241003c7f7be8042861aea3c314f13d9)
├── 인사이트 (보라) — Insights DB + News & Tips
├── 웍스/노트 (파랑) — Roles DB + Works DB
├── 태스크 (빨강) — Beyond_Tasks DB (242003c7-f7be-804a-9d6e-f76d5d0347b4)
└── 파이낸스 — 타임라인 (28f003c7-f7be-8080-85b4-d73efe3cb896)
              + 예정 수입/지출 (15007d59-2e5f-4b88-85a3-95fb4c77b90a)
```

### 주요 DB ID
- Beyond_Tasks: `242003c7-f7be-804a-9d6e-f76d5d0347b4`
- 타임라인(가계부): `28f003c7-f7be-8080-85b4-d73efe3cb896`
- 예정 수입/지출: `15007d59-2e5f-4b88-85a3-95fb4c77b90a`
- Insights: `241003c7-f7be-800b-b71c-df3acddc5bb8`
- Works: `241003c7-f7be-8011-8ba4-cecf131df2a0`

### Notion API 인증
- Internal Integration Token: `.env.local`의 `NOTION_API_KEY`에 저장
- 보조 PC 로컬: `~/.claude/channels/telegram/reminders/.notion_token`에 토큰 있음
- Notion API Version: `2022-06-28`

## 현재 진행 상태

### 완료
- [x] 디자인 토큰, 와이어프레임, Next.js 초기화
- [x] Notion API CRUD (tasks/finance/insights/works/search/pages/blocks)
- [x] 홈 위젯 시스템 (섹션 드래그, DB Picker, 실데이터 매핑)
- [x] OAuth + 세션 관리 + PWA manifest/SW
- [x] Vercel 프로덕션 배포

### 진행 중
- [ ] 모바일 PWA 해상도/키보드/위젯 렌더링 버그 수정
- [ ] Generic DB renderer 리팩터
- [ ] 본문 블록 편집 기능

## 레포
- GitHub: https://github.com/beyondworks/notion-to-lean
- 브랜치: main

## 환경 변수 (.env.local)
```
NOTION_API_KEY=ntn_xxx  # Notion Internal Integration Token
```

## 개발 명령어
```bash
npm run dev    # 로컬 개발 서버
npm run build  # 프로덕션 빌드
npm run lint   # ESLint
```

## UI 변경 검증 규칙 (절대 규칙)

1. **`npm run build` 통과는 검증이 아니다** — 빌드는 컴파일 확인일 뿐, 기능/디자인 확인이 아님
2. **UI/CSS 변경 후 반드시 브라우저에서 시각 확인** — dev 서버 띄우고 `http://localhost:3000/app` 에서 직접 확인. Playwright 스크린샷 또는 MCP 브라우저로 캡처
3. **모바일 레이아웃 변경 시** — 브라우저 DevTools 모바일 뷰(iPhone 크기)로 확인 필수
4. **비동기 데이터 로딩 관련 수정 시** — 빈 상태 → 로드 완료 전환까지 확인. race condition 고려
5. **"완료" 보고 전** — 수정한 각 항목에 대해 시각적 증거(스크린샷/curl 결과)를 직접 확인한 뒤 보고
6. **확인 없이 "완료" 선언 절대 금지** — 코드 리뷰/빌드 통과/에이전트 리뷰는 기능 동작 증거가 아님
