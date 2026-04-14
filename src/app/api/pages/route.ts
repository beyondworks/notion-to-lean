import { NextResponse } from 'next/server';
import { isNotionEnabled, createPage, pageUrl } from '@/lib/notion';

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
    const properties: Record<string, unknown> = {
      ...(body.properties ?? {}),
      Name: { title: [{ text: { content: body.title } }] },
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
