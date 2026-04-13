export type ViewMode = 'list' | 'board' | 'gallery';

export interface NotionDBItem {
  id: string;
  title: string;
  status: 'To Do' | 'In Progress' | 'Done';
  date?: string;
  tags?: string[];
  cover?: string;
  icon?: string;
}

export interface NotionDB {
  id: string;
  title: string;
  icon: string;
  items: NotionDBItem[];
  availableViews: ViewMode[];
}

export interface WidgetConfig {
  id: string;
  dbId: string;
  title: string;
  icon: string;
  viewMode: ViewMode;
}

export const MOCK_DATABASES: NotionDB[] = [
  {
    id: 'db_projects_01',
    title: '프로젝트 및 목표',
    icon: '🎯',
    availableViews: ['gallery', 'board', 'list'],
    items: [
      { id: 'p1', title: 'Q3 마케팅 전략 기획', status: 'In Progress', date: '이번 주', tags: ['Work', 'Marketing'], cover: 'https://images.unsplash.com/photo-1568992687947-868a62a9f521?auto=format&fit=crop&q=80&w=600&h=400', icon: '📊' },
      { id: 'p2', title: 'React 앱 고도화', status: 'To Do', date: '다음 주', tags: ['Study', 'Dev'], cover: 'https://images.unsplash.com/photo-1555066931-bf19f8fd1085?auto=format&fit=crop&q=80&w=600&h=400', icon: '💻' },
      { id: 'p3', title: '바디프로필 준비', status: 'In Progress', date: '12월 31일', tags: ['Life', 'Health'], cover: 'https://images.unsplash.com/photo-1604480133080-602261a680df?auto=format&fit=crop&q=80&w=600&h=400', icon: '🏋️' },
    ]
  },
  {
    id: 'db_tasks_02',
    title: '할 일 관리 (오늘)',
    icon: '✅',
    availableViews: ['list', 'board'],
    items: [
      { id: 't1', title: '팀 주간 회의 준비 및 자료 작성', status: 'In Progress', date: '10:00 AM', tags: ['Work', 'High Priority'], icon: '📝' },
      { id: 't2', title: '이메일 회신 및 일정 정리', status: 'To Do', date: '1:00 PM', tags: ['Work'], icon: '✉️' },
      { id: 't3', title: '헬스장 방문 (가슴, 삼두)', status: 'To Do', date: '7:30 PM', tags: ['Life', 'Health'], icon: '💪' },
      { id: 't4', title: '영양제 주문하기', status: 'Done', date: '완료됨', tags: ['Life'], icon: '💊' },
    ]
  },
  {
    id: 'db_notes_03',
    title: '빠른 메모',
    icon: '📝',
    availableViews: ['gallery', 'list'],
    items: [
      { id: 'n1', title: '앱 디자인 아이디어', status: 'In Progress', tags: ['Design', 'Idea'], icon: '💡' },
      { id: 'n2', title: '주말 제주도 여행 계획', status: 'To Do', tags: ['Travel', 'Life'], icon: '✈️' },
      { id: 'n3', title: '장보기 목록', status: 'Done', tags: ['Life'], icon: '🛒' },
    ]
  }
];

export const RECENT_DOCS = [
  { id: 'r1', title: '팀 주간 회의 준비 및 자료 작성', icon: '📝', dbTitle: '할 일 관리' },
  { id: 'r2', title: 'Q3 마케팅 전략 기획', icon: '📊', dbTitle: '프로젝트' },
  { id: 'r3', title: '앱 디자인 아이디어', icon: '💡', dbTitle: '빠른 메모' },
];
