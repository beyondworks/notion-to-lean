import { NextRequest, NextResponse } from 'next/server';
import type { SearchResult } from '@/lib/types';
import {
  isNotionEnabled,
  getRequestApiKey,
  searchNotion,
  getPropertyValueMulti,
  pageUrl,
} from '@/lib/notion';

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
// GET /api/search?q=...
// ---------------------------------------------------------------------------
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';

  if (!q) {
    return NextResponse.json({ results: [] });
  }

  const token = getRequestApiKey(request);
  if (!isNotionEnabled(token)) {
    return NextResponse.json({ results: [], mock: false });
  }

  try {
    const pages = await searchNotion(q, token);
    const qLower = q.toLowerCase();

    // Extract a title from any page by scanning all title-type properties
    function extractTitle(page: any): string {
      // First try known names
      const known = getPropertyValueMulti(
        page,
        ['Entry name', 'Entry', 'Name', '이름', 'Title', '제목'],
        'title',
      );
      if (known) return known;
      // Fallback: iterate all properties and pick the first with type=title
      for (const def of Object.values(page.properties ?? {})) {
        const d = def as any;
        if (d?.type === 'title' && Array.isArray(d.title)) {
          return d.title.map((t: any) => t.plain_text || '').join('').trim();
        }
      }
      return '';
    }

    const results: SearchResult[] = pages
      .filter((p: any) => p.object === 'page')
      .map((page: any) => {
        const title = extractTitle(page);
        const parentDbId = page.parent?.database_id ?? '';
        const mapping = DB_ICON_MAP[parentDbId] ?? { type: 'work' as const, icon: 'FileText' };
        return {
          id: page.id,
          title: title || '(제목 없음)',
          type: mapping.type,
          icon: mapping.icon,
          url: pageUrl(page.id),
        };
      })
      // Only keep items whose title actually contains the query (case-insensitive)
      .filter((r) => r.title && r.title !== '(제목 없음)' && r.title.toLowerCase().includes(qLower));

    return NextResponse.json({ results, mock: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Search failed', detail: message },
      { status: 500 },
    );
  }
}
