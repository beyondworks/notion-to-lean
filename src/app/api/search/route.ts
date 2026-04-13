import { NextRequest, NextResponse } from 'next/server';
import type { SearchResult } from '@/lib/types';
import {
  isNotionEnabled,
  searchNotion,
  getPropertyValueMulti,
  pageUrl,
} from '@/lib/notion';
import { MOCK_TASKS, MOCK_FINANCE, MOCK_INSIGHTS, MOCK_WORKS } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// Icon mapping for Notion parent database
// ---------------------------------------------------------------------------
const DB_ICON_MAP: Record<string, { type: SearchResult['type']; icon: string }> = {
  '242003c7-f7be-804a-9d6e-f76d5d0347b4': { type: 'task', icon: 'CheckCircle2' },
  '28f003c7-f7be-8080-85b4-d73efe3cb896': { type: 'finance', icon: 'Banknote' },
  '15007d59-2e5f-4b88-85a3-95fb4c77b90a': { type: 'finance', icon: 'Banknote' },
  '241003c7-f7be-800b-b71c-df3acddc5bb8': { type: 'insight', icon: 'Sparkles' },
  '241003c7-f7be-8011-8ba4-cecf131df2a0': { type: 'work', icon: 'Briefcase' },
};

// ---------------------------------------------------------------------------
// Mock search: simple case-insensitive title match
// ---------------------------------------------------------------------------
function searchMock(q: string): SearchResult[] {
  const lower = q.toLowerCase();
  const results: SearchResult[] = [];

  for (const t of MOCK_TASKS) {
    if (t.title.toLowerCase().includes(lower)) {
      results.push({ id: t.id, title: t.title, type: 'task', icon: 'CheckCircle2', url: '/tasks' });
    }
  }
  for (const f of MOCK_FINANCE) {
    if (f.client.toLowerCase().includes(lower)) {
      results.push({ id: f.id, title: f.client, type: 'finance', icon: 'Banknote', url: '/finance' });
    }
  }
  for (const i of MOCK_INSIGHTS) {
    if (i.title.toLowerCase().includes(lower)) {
      results.push({ id: i.id, title: i.title, type: 'insight', icon: 'Sparkles', url: '/insights' });
    }
  }
  for (const w of MOCK_WORKS) {
    if (w.title.toLowerCase().includes(lower)) {
      results.push({ id: w.id, title: w.title, type: 'work', icon: 'Briefcase', url: '/works' });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// GET /api/search?q=...
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  if (!isNotionEnabled()) {
    return NextResponse.json({ results: searchMock(q), mock: true });
  }

  try {
    const pages = await searchNotion(q);
    const results: SearchResult[] = pages
      .filter((p: any) => p.object === 'page')
      .map((page: any) => {
        const title = getPropertyValueMulti(
          page,
          ['Name', '이름', 'Title', '제목'],
          'title',
        );

        const parentDbId = page.parent?.database_id ?? '';
        const mapping = DB_ICON_MAP[parentDbId] ?? { type: 'work' as const, icon: 'FileText' };

        return {
          id: page.id,
          title: title || '(제목 없음)',
          type: mapping.type,
          icon: mapping.icon,
          url: pageUrl(page.id),
        };
      });

    return NextResponse.json({ results, mock: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Search failed', detail: message },
      { status: 500 },
    );
  }
}
