<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 이 프로젝트의 실제 앱은 public/design/ 이다

`/app` 경로는 `next.config.ts` rewrite로 `public/design/Notion Mobile App.html`을 서빙한다.
`src/app/` 디렉토리는 API route 전용이다. UI 컴포넌트 수정 시 `src/` 가 아닌 `public/design/src/*.jsx`를 수정해야 한다.

## 수정 대상 판별
- UI/레이아웃/스타일 → `public/design/` (HTML, JSX, CSS)
- API 엔드포인트 → `src/app/api/`
- `src/app/layout.tsx`, `src/components/` → 현재 `/app` 경로에서 사용되지 않음

## 검증 필수
- UI 변경 후 `npm run build` 통과만으로 완료 선언 금지
- 반드시 브라우저에서 `/app` 경로를 열어 시각적으로 확인
