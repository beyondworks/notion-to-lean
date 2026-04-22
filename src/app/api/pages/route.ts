import { NextResponse } from 'next/server';
import { isNotionEnabled, createPage, pageUrl } from '@/lib/notion';

// Fetch a database's schema (REST) — we need this to discover the title property name
async function getDatabaseSchema(dbId: string): Promise<Record<string, any> | null> {
  const apiKey = process.env.NOTION_API_KEY;
  if (!apiKey) return null;
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.properties ?? null;
}

function findTitleProperty(schema: Record<string, any>): string | null {
  for (const [name, def] of Object.entries(schema)) {
    if ((def as any)?.type === 'title') return name;
  }
  return null;
}

// ---------------------------------------------------------------------------
// POST /api/pages — Create a new page in a Notion database
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  let body: { dbId?: string; title?: string; properties?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body.dbId !== 'string' || !body.dbId.trim()) {
    return NextResponse.json({ error: 'dbId is required' }, { status: 400 });
  }

  if (typeof body.title !== 'string' || !body.title.trim()) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 });
  }

  if (!isNotionEnabled()) {
    const mockId = `mock-${Date.now()}`;
    return NextResponse.json(
      { id: mockId, url: `https://notion.so/${mockId}`, mock: true },
      { status: 201 },
    );
  }

  try {
    // Discover the correct title property name for this DB (e.g., "Entry name", "Name", "Title")
    const schema = await getDatabaseSchema(body.dbId);
    const titleKey = schema ? findTitleProperty(schema) : null;
    if (!titleKey) {
      return NextResponse.json({ error: 'Database has no title property' }, { status: 500 });
    }

    const properties: Record<string, unknown> = {
      ...(body.properties ?? {}),
      [titleKey]: { title: [{ text: { content: body.title } }] },
    };

    const pageId = await createPage(body.dbId, properties);
    if (!pageId) {
      return NextResponse.json({ error: 'Failed to create page' }, { status: 500 });
    }

    return NextResponse.json(
      { id: pageId, url: pageUrl(pageId), mock: false },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[pages POST]', message);
    return NextResponse.json({ error: 'Failed to create page', detail: message }, { status: 500 });
  }
}
