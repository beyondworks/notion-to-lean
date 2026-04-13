import type { Task, FinanceEntry, Insight, Work } from './types';

export const MOCK_TASKS: Task[] = [
  { id: 't1', title: '해커스 2차시 수정본 전달', category: '강의', categoryColor: 'green', dueDate: '4/8', done: false },
  { id: 't2', title: '매직라이트 영상 업로드', category: 'Video', categoryColor: 'orange', dueDate: '4/8', done: false },
  { id: 't3', title: 'Magiclight 영상 최종 게시', category: 'Video', categoryColor: 'orange', dueDate: '4/14', done: false },
  { id: 't4', title: '프로젝트 A 기획서 검토', category: '기획', categoryColor: 'blue', dueDate: '4/15', done: false },
  { id: 't5', title: '디자인 시스템 정리', category: '디자인', categoryColor: 'purple', dueDate: '4/16', done: false },
  { id: 't6', title: '세븐플러스 미팅', category: '회의', categoryColor: 'gray', dueDate: '4/10', done: true },
  { id: 't7', title: 'RelayAX 마곡 미팅', category: '회의', categoryColor: 'gray', dueDate: '4/7', done: true },
  { id: 't8', title: 'Notion DB 연동 범위 확정', category: '기획', categoryColor: 'blue', dueDate: '4/5', done: true },
];

export const MOCK_FINANCE: FinanceEntry[] = [
  { id: 'f1', client: '아카데미', type: 'income', amount: 2000000, date: null },
  { id: 'f2', client: 'KCC정보통신', type: 'income', amount: 1500000, date: null },
  { id: 'f3', client: '젠스파크', type: 'income', amount: 1100000, date: null },
  { id: 'f4', client: '매직라이트', type: 'income', amount: 700000, date: null },
  { id: 'f5', client: '사무실 월세', type: 'expense', amount: 1200000, date: null },
  { id: 'f6', client: '소프트웨어 구독', type: 'expense', amount: 440000, date: null },
];

export const MOCK_INSIGHTS: Insight[] = [
  {
    id: 'i1',
    title: 'Google Gemma 4 출시 분석',
    description: 'Apache 2.0 라이선스, MoE 26B 아키텍처로 오픈소스 진영에서 가장 강력한 추론 모델로 등장했다.',
    category: 'AI',
    coverColor: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
    tags: ['AI', 'Google'],
    date: null,
  },
  {
    id: 'i2',
    title: 'Anthropic 4/4 정책 변경',
    description: 'Claude Pro/Max 구독 third-party 앱 사용 제한 및 API 정책 업데이트가 개발자에게 미치는 영향 분석.',
    category: 'Policy',
    coverColor: 'linear-gradient(135deg, #fca5a5 0%, #dc2626 100%)',
    tags: ['Policy', 'Anthropic'],
    date: null,
  },
  {
    id: 'i3',
    title: 'awesome-design-md 35K stars',
    description: '10일 만에 GitHub 역대 최속 스타 증가 기록. 디자인 시스템 문서화 방법론을 마크다운으로 정리한 레포.',
    category: 'Design',
    coverColor: 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)',
    tags: ['Design', 'GitHub'],
    date: null,
  },
  {
    id: 'i4',
    title: 'Claude Code 에이전트 패턴',
    description: '서브에이전트 오케스트레이션, 병렬 실행, 결과 집계까지 — 실전 멀티에이전트 구현 패턴 정리.',
    category: 'AI',
    coverColor: 'linear-gradient(135deg, #c4b5fd 0%, #7c3aed 100%)',
    tags: ['AI', 'Claude'],
    date: null,
  },
  {
    id: 'i5',
    title: 'Figma AI 자동 디자인 발표',
    description: '디자인 작업의 80%를 자동화하겠다는 발표. 컴포넌트 생성, 레이아웃 제안, 배색까지 AI가 처리한다.',
    category: 'Design',
    coverColor: 'linear-gradient(135deg, #60a5fa 0%, #1d4ed8 100%)',
    tags: ['Design', 'Figma'],
    date: null,
  },
  {
    id: 'i6',
    title: 'Notion DB 뷰 자동화 팁',
    description: '3가지 뷰 설정으로 주간 리뷰를 10분으로 단축하는 Notion 데이터베이스 자동화 실전 세팅 가이드.',
    category: 'Tips',
    coverColor: 'linear-gradient(135deg, #fdba74 0%, #ea580c 100%)',
    tags: ['Tips', 'Notion'],
    date: null,
  },
];

export const MOCK_WORKS: Work[] = [
  {
    id: 'w1',
    title: '세븐플러스 K-art 기획안',
    description: '기획 방향 1차 검토 완료',
    category: '기획',
    coverColor: 'linear-gradient(135deg, #e7f3f8 0%, #b8d9ec 100%)',
    status: 'done',
  },
  {
    id: 'w2',
    title: 'Magiclight 영상 대본',
    description: '초안 전달 완료',
    category: 'Video',
    coverColor: 'linear-gradient(135deg, #fbecdd 0%, #f5c897 100%)',
    status: 'progress',
  },
  {
    id: 'w3',
    title: '해커스 바이브코딩',
    description: '2차시 수정본 작업 중',
    category: '강의',
    coverColor: 'linear-gradient(135deg, #edf3ec 0%, #b2d9b5 100%)',
    status: 'progress',
  },
  {
    id: 'w4',
    title: 'Notion-to-Lean 허브',
    description: '프로토타입 구축 중',
    category: '개발',
    coverColor: 'linear-gradient(135deg, #f4f0f7 0%, #d5c0e8 100%)',
    status: 'progress',
  },
  {
    id: 'w5',
    title: '브랜드 가이드라인',
    description: '초안 작성 대기',
    category: '디자인',
    coverColor: 'linear-gradient(135deg, #f9eef3 0%, #edb3d0 100%)',
    status: 'todo',
  },
  {
    id: 'w6',
    title: '투자 IR 자료',
    description: '2차 라운드 준비',
    category: '비즈니스',
    coverColor: 'linear-gradient(135deg, #f4eeee 0%, #ddb89e 100%)',
    status: 'todo',
  },
];
