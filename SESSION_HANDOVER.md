# Session Handover

## 날짜: 2026-04-22

## 프로젝트 경로 중요
- 디자인 번들 실제 파일 위치는 **`public/design/`** (원본은 외부 `/Users/yoogeon/Projects/notion-to-lean/notion to lean/` 이었으나 심볼릭 링크 대신 실제 복사본). 수정은 모두 `public/design/` 에 직접.
- Next.js dev server 포트: **6001** (6000은 X11 reserved)
- `.env.local` 은 worktree에 심볼릭 링크로 연결되어 있음 → `ln -sf /Users/yoogeon/Projects/notion-to-lean/.env.local .env.local`

## 완료

### 디자인 시스템 전환 (Stitch M3 → Notion × iOS 26)
- `public/design/Notion Mobile App.html` 을 메인 엔트리로 사용
- `src/app/globals.css` Notion 토큰 교체 + `public/design/styles/notion-ios.css` 가 실제 동작 스타일
- 반응형 Phone 프레임: 데스크톱 베젤 / 모바일 풀스크린 + chrome 숨김
- 배경: radial-gradient warm beige `#F1EEE7 → #DDD6C7`
- 다크 모드 토글 (홈 navbar + 설정)

### 홈: 섹션 + 위젯 시스템 (3번째 커밋의 핵심)
- `nm-sections` (배열 {id, name}) + `nm-section-{id}-widgets` (위젯 배열) 로 섹션 자유 구성
- 첫 섹션 헤더의 **연필 아이콘** 또는 **롱프레스 500ms** 로 편집 모드
- 편집 모드 전역 (SectionList에 상태 리프트) — 모든 섹션이 함께 지글
- iOS 스타일 FLIP 애니메이션 (cubic-bezier 0.22,1,0.36,1 · 320ms)
- pointer capture + touch-action: none + elementFromPoint 로 **섹션 간 이동** 지원
- × 배지 제거 / 드래그 재배치 / "DB 추가" + "섹션 추가" (편집 모드에서만)
- DB Picker: `/api/databases` 에서 48개 DB 목록, pin 토글 양방향 동기화
- DB 이름 매핑 ("홈: 태스크 · 캘린더" 같은 라벨) 으로 혼동 방지

### 실시간 Notion 동기화
- HomeScreen/CalendarScreen/DbListScreen/InboxScreen/PageScreen: **20초 폴링 + visibilitychange + focus** 핸들러
- 체크박스 양방향 확인됨 (POST /api/tasks → Notion Completed=true)
- 데스크톱 Notion 변경사항이 앱 탭 복귀 시 즉시 반영

### 페이지 상세
- 제목 contentEditable + 상태/완료 토글 (서버가 property 타입 auto-discover)
- 블록 재귀 렌더링: heading / to_do / bulleted / numbered / toggle / callout / code / image / bookmark / embed / video / file / child_database / table
- child_database는 엔트리 20개까지 미리보기 (YouTube/Threads 등 Platform 속성 포함)
- 커버/아이콘: emoji / external / file / custom_emoji 4종 타입 지원

### DB 리스트
- dbKey 있으면 코어 엔드포인트, 없으면 `/api/insights?dbId=` 로 임의 DB 쿼리 → 어떤 DB든 리스트 뷰
- 헤더 제목 contentEditable → `nm-db-alias-w-{widgetKey}` 저장 → 홈 위젯에 자동 propagation
- 캘린더: 셀 fixed height 58px + 배지 슬롯 예약 → 열/행 정렬 유지, 배지 blue 톤으로 완화

### 가계부 (Finance)
- 수입/지출/잔액 요약 카드 + 3탭 필터 + 타입별 컬러 보더

### 검색
- `/api/search` 전체 title-type property 스캔 → title 매칭으로 필터링 → "(제목 없음)" 해소
- 결과 + 스크롤 위치 sessionStorage 저장 → 뒤로가기 시 복원

### 설정 / 프로필
- 설정: 알림 권한 요청 / 글자 크기 (`html[data-font-size]` CSS 변수 override) / 언어 (한국어 ↔ English reload) / 캐시 비우기 / 다크모드 / 오프라인
- 프로필 페이지: 이름/워크스페이스/아바타/요금제 편집 (localStorage)

### 탭바
- 5탭 리퀴드 글래스 독: 홈/검색/새로/인박스/나
- 검색/새로/설정의 "취소" 모두 `goBack()` 으로 직전 화면 복귀
- 탭바 뒤 그라데이션 fade: mask-image 로 콘텐츠만 투명화 (탭바 색조 변경 없음)

### 인박스
- 못한 일(overdue) · 오늘 · 새로 도착 (Scrap DB) 통합 뷰
- 체크박스 탭 즉시 완료 + PATCH Notion

## 미완료

### High priority
- **Notion API 키가 환경변수로만 연결됨** — 프로덕션 배포 시 Vercel 환경변수에 `NOTION_API_KEY` 설정 필요
- **본문 블록 편집 기능 (2번 Phase 1~3)** — 현재 블록 렌더만 가능, 편집은 체크박스만 양방향. 텍스트 편집/`/` 커맨드 미구현
- **페이지 상세 인라인 DB 이름 변경 시 홈 실시간 반영** — 현재는 `nm-section-update` CustomEvent 로 동작하지만 다른 섹션 인스턴스에서만 작동. 직접 같은 탭 내 라이브 반영 체크 필요

### Medium priority
- **가계부 추가 전용 시트** — EventEditScreen은 title만 보내는 구조, 수입/지출/금액/카테고리/관계형 필드 확장 미구현
- **Notion DB 아이콘 대부분 null** — 워크스페이스 DB에 이모지 아이콘 수동 설정 필요 (Notion 자체 제약). 현재 첫글자 monogram fallback
- **캘린더 월 이동** — 좌측 `<` 버튼은 홈으로 가는 goBack. 월 +/- 이동 컨트롤 없음
- **Events DB 추가 시트** — 현재 `+` 새로 탭 누르면 태스크로만 생성됨, 캘린더에선 dbKey=tasks 동일. 별도 시간 입력 UI 필요

### Low priority
- **Finance Picker DB picker 결과 sort** — 이름 정렬은 OK, pinned 가 맨 위 배치되는지 회귀 확인 필요
- **다크모드 일부 컴포넌트 대비** — Tag 색상이 라이트/다크 팔레트 정의되어 있지만 actual visual 검증 필요
- **Onboarding / Token / DbPicker flow** — 화면은 있지만 토큰 저장 로직은 UI only, 저장 안 됨 (`.env.local` 수동 설정 기반)

## 에러/학습

### Notion API 함정
- Beyond_Tasks DB의 title property는 **"Entry name"** (NOT "Name" or "Title"). `/api/pages` POST에서 DB 스키마 조회 후 title 타입 자동 탐지로 해결
- `Completed` checkbox property는 `/api/tasks` POST 의 propertyName 리스트에 원래 없었음 → 먼저 시도하도록 추가
- `/v1/search` 응답의 DB 아이콘이 거의 null — 개별 DB retrieve도 마찬가지. 워크스페이스 설정 문제
- Notion `data_sources` API (SDK v5) 는 일부 쿼리에서 잘못된 엔드포인트로 감 → REST 직접 호출 (`/v1/databases/{id}/query`)

### React 함정
- `onEditChange` 같은 인라인 콜백 prop을 자식 `useEffect` dep에 넣으면 매 렌더마다 함수 아이덴티티 바뀜 → 무한 루프. 상태 리프트 or `useCallback` 필수
- `contentEditable` 안에서 정보 업데이트할 때 value 바인딩 대신 `onBlur` 에서만 읽는 게 안전 (cursor position 유지)
- `.navbar-title-compact` 에 `pointer-events: none` 걸면 뒤의 back 버튼 클릭 OK 되지만 내부 editable 도 안 됨. 외부 none + 내부 span auto 로 분리

### CSS 드래그
- HTML5 drag는 모바일에서 사실상 동작 안 함 → pointer events + `setPointerCapture` + `touch-action: none` 조합
- `elementFromPoint` 는 dragged element 자체를 반환 → 일시적으로 `pointer-events: none` 처리 후 호출해야 sibling 감지
- FLIP 기법은 `useLayoutEffect` 에서 getBoundingClientRect 스냅샷 → 즉시 transform 역적용 → 다음 프레임에 transition 으로 원복

### UX 실수
- 색 그라데이션 오버레이로 "fade" 구현하면 배경색 톤을 바꿈 → `mask-image` 로 콘텐츠 알파 감소가 정답
- 지글 애니메이션 0.2s는 너무 빠름 → 0.6s + 각도 ±0.6도가 iOS에 가까움
- Tap highlight: `-webkit-tap-highlight-color: transparent` 필수

### 사용자 피드백 패턴
- 변경사항이 "된다고 말하지만 실제 테스트 안 한" 상태로 보고하면 사용자 매우 불신
- 매 변경 후 `curl` 로 API 응답 or 페이지 렌더를 실제 확인하고 보고
- "X를 바꾸면 Y에도 반영되어야" 같은 상식적 동기화는 선제적으로 구현 (요청 없이도)

## 다음 세션 시작 시

1. **dev server 복구**: `PORT=6001 npm run dev > /tmp/next-dev-6001.log 2>&1 &`
2. **브라우저 열기**: `http://localhost:6001/design/Notion%20Mobile%20App.html`
3. **지금 상태 시각 확인**:
   - 홈 "즐겨찾기" 섹션 + 추가 섹션 렌더
   - 연필 아이콘 → 편집 모드 → 섹션 간 드래그 테스트
   - 캘린더 헤더 "Calendar · 4월 2026" + 배지 blue 톤
   - 오늘 체크박스 탭 → Notion 반영 확인
4. **우선순위 선택**:
   - A) 본문 블록 편집 (2번 Phase 1: paragraph 터치 편집)
   - B) 가계부 수입/지출 추가 시트 (관계형 포함)
   - C) 월 이동 컨트롤 + 이벤트 시간 입력
5. **푸시된 최신 커밋**: `5fd988b feat: home sections + bento widgets + live Notion sync` (claude/fervent-mccarthy 브랜치)
