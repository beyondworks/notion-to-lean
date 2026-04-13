import { NextResponse } from 'next/server';
import type { Insight } from '@/lib/types';
import {
  isNotionEnabled,
  queryDatabase,
  getPropertyValueMulti,
  pageUrl,
  DB_IDS,
} from '@/lib/notion';
import { MOCK_INSIGHTS } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// Category -> gradient mapping (fallback when Notion has no cover color)
// ---------------------------------------------------------------------------
const CATEGORY_GRADIENTS: Record<string, string> = {
  AI: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
  Policy: 'linear-gradient(135deg, #fca5a5 0%, #dc2626 100%)',
  Design: 'linear-gradient(135deg, #93c5fd 0%, #2563eb 100%)',
  Tips: 'linear-gradient(135deg, #fdba74 0%, #ea580c 100%)',
};

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #d1d5db 0%, #6b7280 100%)';

// ---------------------------------------------------------------------------
// Map a Notion page -> Insight
// ---------------------------------------------------------------------------
function pageToInsight(page: any): Insight {
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

  const multiTags = getPropertyValueMulti(
    page,
    ['Tags', '태그', 'Labels', '라벨'],
    'multi_select',
  );
  const tags = Array.isArray(multiTags)
    ? multiTags.map((t: { name: string }) => t.name)
    : [];

  const date = getPropertyValueMulti(
    page,
    ['Date', '날짜', '일자', 'Created', '작성일'],
    'date',
  );

  return {
    id: page.id,
    title: title || '(제목 없음)',
    description,
    category,
    coverColor: CATEGORY_GRADIENTS[category] ?? DEFAULT_GRADIENT,
    tags,
    date,
    notionUrl: pageUrl(page.id),
  };
}

// ---------------------------------------------------------------------------
// GET /api/insights
// ---------------------------------------------------------------------------
export async function GET() {
  if (!isNotionEnabled()) {
    return NextResponse.json({ data: MOCK_INSIGHTS, mock: true });
  }

  try {
    const pages = await queryDatabase(DB_IDS.INSIGHTS);
    const data: Insight[] = pages.map(pageToInsight);
    return NextResponse.json({ data, mock: false });
  } catch (err) {
    console.warn('[notion fallback]', err instanceof Error ? err.message : err);
    return NextResponse.json({ data: MOCK_INSIGHTS, mock: true, fallback: true });
  }
}
