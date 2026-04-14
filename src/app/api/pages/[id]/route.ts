import { NextResponse } from 'next/server';
import {
  isNotionEnabled,
  getPage,
  updatePage,
  archivePage,
  getPropertyValueMulti,
  pageUrl,
} from '@/lib/notion';

// ---------------------------------------------------------------------------
// GET /api/pages/[id] — Retrieve page properties + metadata
// ---------------------------------------------------------------------------
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isNotionEnabled()) {
    return NextResponse.json({
      id,
      title: '(Mock Page)',
      cover: null,
      icon: null,
      properties: {},
      blocks: [],
      notionUrl: `https://notion.so/${id}`,
      lastEditedAt: new Date().toISOString(),
      lastEditedBy: 'mock',
      mock: true,
    });
  }

  try {
    const page = await getPage(id);
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const title = getPropertyValueMulti(
      page,
      ['Name', '이름', 'Title', '제목'],
      'title',
    );

    const cover = page.cover?.external?.url ?? page.cover?.file?.url ?? null;
    const icon = page.icon?.emoji ?? page.icon?.external?.url ?? null;

    return NextResponse.json({
      id: page.id,
      title: title || '(제목 없음)',
      cover,
      icon,
      properties: page.properties ?? {},
      blocks: [],
      notionUrl: pageUrl(page.id),
      lastEditedAt: page.last_edited_time ?? '',
      lastEditedBy: page.last_edited_by?.id ?? '',
      mock: false,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[pages/[id] GET]', message);
    return NextResponse.json({ error: 'Failed to retrieve page', detail: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/pages/[id] — Update page properties
// ---------------------------------------------------------------------------
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: { properties?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.properties || typeof body.properties !== 'object') {
    return NextResponse.json({ error: 'properties object is required' }, { status: 400 });
  }

  if (!isNotionEnabled()) {
    return NextResponse.json({ success: true, mock: true });
  }

  try {
    await updatePage(id, body.properties);
    return NextResponse.json({ success: true, mock: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[pages/[id] PATCH]', message);
    return NextResponse.json({ error: 'Failed to update page', detail: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// DELETE /api/pages/[id] — Archive (soft-delete) a page
// ---------------------------------------------------------------------------
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isNotionEnabled()) {
    return NextResponse.json({ success: true, mock: true });
  }

  try {
    await archivePage(id);
    return NextResponse.json({ success: true, mock: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[pages/[id] DELETE]', message);
    return NextResponse.json({ error: 'Failed to archive page', detail: message }, { status: 500 });
  }
}
