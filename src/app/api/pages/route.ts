import { NextResponse } from 'next/server';
import { getRequestApiKey, isNotionEnabled, createPage, getDatabaseSchema, pageUrl } from '@/lib/notion';

function findTitleProperty(schema: Record<string, any>): string | null {
  for (const [name, def] of Object.entries(schema)) {
    if ((def as any)?.type === 'title') return name;
  }
  return null;
}

function findDateProperty(schema: Record<string, any>): string | null {
  const preferred = ['Date', '날짜', '일자', 'Due', 'Due Date', '마감', '마감일', '시간'];
  for (const name of preferred) {
    if (schema[name]?.type === 'date') return name;
  }
  for (const [name, def] of Object.entries(schema)) {
    if ((def as any)?.type === 'date') return name;
  }
  return null;
}

// ---------------------------------------------------------------------------
// POST /api/pages — Create a new page in a Notion database
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  const token = getRequestApiKey(request);
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

  if (!isNotionEnabled(token)) {
    return NextResponse.json({ error: 'Notion connection required' }, { status: 401 });
  }

  try {
    // Discover the correct title property name for this DB (e.g., "Entry name", "Name", "Title")
    const schema = await getDatabaseSchema(body.dbId, token);
    const titleKey = schema ? findTitleProperty(schema) : null;
    if (!titleKey) {
      return NextResponse.json({ error: 'Database has no title property' }, { status: 500 });
    }

    const incomingProperties: Record<string, unknown> = { ...(body.properties ?? {}) };
    const defaultDate =
      typeof incomingProperties.__defaultDate === 'string'
        ? incomingProperties.__defaultDate
        : null;
    delete incomingProperties.__defaultDate;

    if (defaultDate && schema) {
      const dateKey = findDateProperty(schema);
      if (dateKey && !incomingProperties[dateKey]) {
        incomingProperties[dateKey] = { date: { start: defaultDate } };
      }
    }

    const properties: Record<string, unknown> = {
      ...incomingProperties,
      [titleKey]: { title: [{ text: { content: body.title } }] },
    };

    const pageId = await createPage(body.dbId, properties, token);
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
