import { NextResponse } from 'next/server';
import type { Work } from '@/lib/types';
import {
  isNotionEnabled,
  queryDatabase,
  getPropertyValueMulti,
  pageUrl,
  DB_IDS,
} from '@/lib/notion';
import { MOCK_WORKS } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// Status mapping helpers
// ---------------------------------------------------------------------------
const STATUS_MAP: Record<string, Work['status']> = {
  done: 'done',
  '완료': 'done',
  complete: 'done',
  completed: 'done',
  progress: 'progress',
  '진행중': 'progress',
  'in progress': 'progress',
  '진행': 'progress',
  todo: 'todo',
  '대기': 'todo',
  'not started': 'todo',
  '미시작': 'todo',
};

function mapStatus(raw?: string): Work['status'] {
  if (!raw) return 'todo';
  return STATUS_MAP[raw.toLowerCase()] ?? 'todo';
}

// Category -> gradient mapping
const CATEGORY_GRADIENTS: Record<string, string> = {
  '기획': 'linear-gradient(135deg, #e7f3f8 0%, #b8d9ec 100%)',
  Video: 'linear-gradient(135deg, #fbecdd 0%, #f5c897 100%)',
  '강의': 'linear-gradient(135deg, #edf3ec 0%, #b2d9b5 100%)',
  '개발': 'linear-gradient(135deg, #f4f0f7 0%, #d5c0e8 100%)',
  '디자인': 'linear-gradient(135deg, #f9eef3 0%, #edb3d0 100%)',
  '비즈니스': 'linear-gradient(135deg, #f4eeee 0%, #ddb89e 100%)',
};

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%)';

// ---------------------------------------------------------------------------
// Map a Notion page -> Work
// ---------------------------------------------------------------------------
function pageToWork(page: any): Work {
  const title = getPropertyValueMulti(
    page,
    ['Name', '이름', 'Title', '제목'],
    'title',
  );

  const description = getPropertyValueMulti(
    page,
    ['Description', '설명', '내용', 'Summary', '요약'],
    'rich_text',
  );

  const categorySelect = getPropertyValueMulti(
    page,
    ['Category', '분류', '카테고리', 'Type', '유형'],
    'select',
  );
  const category = categorySelect?.name ?? '';

  // Try status property first, then select-based status
  const statusProp = getPropertyValueMulti(
    page,
    ['Status', '상태', '진행상태'],
    'status',
  );
  const statusName = statusProp?.name ?? '';

  // If no status property, try a select-based one
  const fallbackSelect = statusName
    ? statusName
    : (getPropertyValueMulti(page, ['Status', '상태'], 'select')?.name ?? '');

  return {
    id: page.id,
    title: title || '(제목 없음)',
    description,
    category,
    coverColor: CATEGORY_GRADIENTS[category] ?? DEFAULT_GRADIENT,
    status: mapStatus(fallbackSelect || statusName),
    notionUrl: pageUrl(page.id),
  };
}

// ---------------------------------------------------------------------------
// GET /api/works
// ---------------------------------------------------------------------------
export async function GET() {
  if (!isNotionEnabled()) {
    return NextResponse.json({ data: MOCK_WORKS, mock: true });
  }

  try {
    const pages = await queryDatabase(DB_IDS.WORKS);
    const data: Work[] = pages.map(pageToWork);
    return NextResponse.json({ data, mock: false });
  } catch (err) {
    console.warn('[notion fallback]', err instanceof Error ? err.message : err);
    return NextResponse.json({ data: MOCK_WORKS, mock: true, fallback: true });
  }
}
