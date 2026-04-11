@AGENTS.md

# Notion-to-Lean: 모바일 위젯 대시보드

## 프로젝트 개요
Notion 워크스페이스를 모바일 친화적 위젯 대시보드로 재구성하는 PWA.
Notion 모바일 앱의 불편한 UI를 대체하여, 사용자가 섹션별로 Notion DB를 연결하고
iOS 홈화면 위젯처럼 커스터마이즈 가능한 인터페이스를 제공한다.

## 핵심 컨셉
- "위젯 빌더" — iOS 홈화면처럼 사용자가 위젯을 추가/삭제/재배치
- Notion API로 실시간 데이터, 별도 프론트엔드로 최적 모바일 UX
- 디자인 DNA: Notion warm minimalism + Apple iOS 터치 패턴 하이브리드

## 기술 스택
- Next.js 16+ (App Router, src/ 디렉토리)
- TypeScript
- Tailwind CSS 4
- @notionhq/client (Notion SDK)
- lucide-react (벡터 아이콘, 이모지 사용 금지)
- framer-motion (위젯 드래그/애니메이션)
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
- [x] 디자인 토큰 수집 (Notion + Apple DESIGN.md)
- [x] HTML 와이어프레임 v1~v4 (반복 피드백 반영)
- [x] Next.js 프로젝트 초기화 (create-next-app + 의존성)
- [x] 와이어프레임 보존 (`public/wireframes/v4.html`)

### 다음 단계 (TODO)
- [ ] Tailwind 커스텀 테마 세팅 (design-md 토큰 → tailwind.config)
- [ ] 공통 컴포넌트 구현: Card, Pill, SectionHeader, BottomSheet
- [ ] 위젯 베이스 컴포넌트 + 7종 위젯 구현
- [ ] 위젯 그리드 레이아웃 (2열, 사이즈별 span)
- [ ] 지글 모드 + 드래그 재배치 (framer-motion)
- [ ] Notion API 연동 (서버 컴포넌트 / API routes)
- [ ] 위젯 설정 저장/불러오기 (localStorage + Notion backup)
- [ ] PWA manifest + 서비스 워커
- [ ] Vercel 배포
- [ ] pull-to-refresh, 오프라인 캐시

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
