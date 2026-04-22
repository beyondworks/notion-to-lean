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
  AI: 'linear-gradient(135deg, #9065b0, #c4b5fd)',
  'Claude Code': 'linear-gradient(135deg, #006789, #5acafe)',
  Design: 'linear-gradient(135deg, #006789, #93c5fd)',
  Branding: 'linear-gradient(135deg, #d9730d, #fbbf24)',
  Build: 'linear-gradient(135deg, #615e57, #9ca3af)',
  Marketing: 'linear-gradient(135deg, #c14c8a, #f9a8d4)',
  Scrap: 'linear-gradient(135deg, #448361, #86efac)',
  Policy: 'linear-gradient(135deg, #fca5a5, #dc2626)',
  Tips: 'linear-gradient(135deg, #fdba74, #ea580c)',
};

const DEFAULT_GRADIENT = 'linear-gradient(135deg, #006789, #5acafe)';

// ---------------------------------------------------------------------------
// Map a Notion page -> Insight
// ---------------------------------------------------------------------------
function pageToInsight(page: any): Insight {
  const title = getPropertyValueMulti(
    page,
    ['Entry name', 'Name', '이름', 'Title', '제목'],
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
    createdAt: page.created_time ?? null,
    lastEditedAt: page.last_edited_time ?? undefined,
    notionUrl: pageUrl(page.id),
  };
}

// ---------------------------------------------------------------------------
// GET /api/insights
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  if (!isNotionEnabled()) {
    return NextResponse.json({ data: MOCK_INSIGHTS, mock: true });
  }

  const { searchParams } = new URL(request.url);
  const dbId = searchParams.get('dbId') || DB_IDS.INSIGHTS;

  try {
    const pages = await queryDatabase(dbId);
    const data: Insight[] = pages.map(pageToInsight);
    return NextResponse.json({ data, mock: false });
  } catch (err) {
    console.warn('[notion fallback]', err instanceof Error ? err.message : err);
    return NextResponse.json({ data: MOCK_INSIGHTS, mock: true, fallback: true });
  }
}
