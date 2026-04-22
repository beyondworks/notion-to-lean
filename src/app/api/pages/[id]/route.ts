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
      ['Entry name', 'Entry', 'Name', '이름', 'Title', '제목'],
      'title',
    );

    const cover = page.cover?.external?.url ?? page.cover?.file?.url ?? null;
    const iconRaw = page.icon;
    let icon: string | null = null;
    let iconType: 'emoji' | 'image' | 'custom_emoji' | null = null;
    if (iconRaw) {
      if (iconRaw.type === 'emoji' && iconRaw.emoji) {
        icon = iconRaw.emoji;
        iconType = 'emoji';
      } else if (iconRaw.type === 'external' && iconRaw.external?.url) {
        icon = iconRaw.external.url;
        iconType = 'image';
      } else if (iconRaw.type === 'file' && iconRaw.file?.url) {
        icon = iconRaw.file.url;
        iconType = 'image';
      } else if (iconRaw.type === 'custom_emoji' && iconRaw.custom_emoji?.url) {
        icon = iconRaw.custom_emoji.url;
        iconType = 'custom_emoji';
      }
    }

    // Extract common properties into a flat shape for the UI
    const status =
      getPropertyValueMulti(page, ['Status', '상태', '진행상태'], 'status')?.name ??
      getPropertyValueMulti(page, ['Status', '상태'], 'select')?.name ??
      null;

    const priority =
      getPropertyValueMulti(page, ['Priority', '우선순위'], 'select')?.name ?? null;

    const dueProp =
      getPropertyValueMulti(page, ['Due', 'Date', '기한', '마감', 'Due Date'], 'date');
    const dueDate = dueProp?.start ?? null;

    // completed: null means "no checkbox property on this DB" — UI should not render checkbox
    const hasCompleted =
      page.properties?.Completed?.type === 'checkbox' ||
      page.properties?.['완료']?.type === 'checkbox' ||
      page.properties?.Done?.type === 'checkbox';
    const completedProp = hasCompleted
      ? getPropertyValueMulti(page, ['Completed', 'Done', '완료'], 'checkbox')
      : null;
    const completed = hasCompleted ? completedProp === true : null;

    const categorySelect =
      getPropertyValueMulti(page, ['Category', '분류', '카테고리', 'Type', '유형'], 'select');
    const category = categorySelect?.name ?? null;

    const tagsProp =
      getPropertyValueMulti(page, ['Tags', 'Tag', '태그'], 'multi_select');
    const tags = Array.isArray(tagsProp) ? tagsProp.map((t: any) => t.name).filter(Boolean) : [];

    return NextResponse.json({
      id: page.id,
      title: title || '(제목 없음)',
      cover,
      icon,
      iconType,
      properties: {
        status,
        priority,
        dueDate,
        completed,
        category,
        tags,
      },
      propertiesRaw: page.properties ?? {},
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
// Accepts { properties: {...} } OR shortcut fields { title, completed, status }
// ---------------------------------------------------------------------------
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: {
    properties?: Record<string, unknown>;
    title?: string;
    completed?: boolean;
    status?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!isNotionEnabled()) {
    return NextResponse.json({ success: true, mock: true });
  }

  try {
    // Fetch current page to discover actual property names
    const page = await getPage(id);
    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }

    const props: Record<string, unknown> = { ...(body.properties ?? {}) };

    // Find property by type
    const findPropByType = (type: string): string | null => {
      const entries = Object.entries(page.properties ?? {});
      for (const [name, def] of entries) {
        if ((def as any)?.type === type) return name;
      }
      return null;
    };

    // Shortcut: title
    if (typeof body.title === 'string') {
      const titleKey = findPropByType('title');
      if (titleKey) {
        props[titleKey] = { title: [{ text: { content: body.title } }] };
      }
    }

    // Shortcut: completed (checkbox)
    if (typeof body.completed === 'boolean') {
      // Prefer a property named Completed / 완료 / Done if exists
      const candidates = ['Completed', '완료', 'Done'];
      let key: string | null = null;
      for (const c of candidates) {
        if (page.properties?.[c]?.type === 'checkbox') { key = c; break; }
      }
      if (!key) key = findPropByType('checkbox');
      if (key) props[key] = { checkbox: body.completed };
    }

    // Shortcut: status
    if (typeof body.status === 'string') {
      const candidates = ['Status', '상태'];
      let key: string | null = null;
      let kind: 'status' | 'select' | null = null;
      for (const c of candidates) {
        const t = page.properties?.[c]?.type;
        if (t === 'status' || t === 'select') { key = c; kind = t; break; }
      }
      if (!key) {
        key = findPropByType('status') || findPropByType('select');
        if (key) kind = (page.properties?.[key] as any).type;
      }
      if (key && kind) {
        props[key] = kind === 'status'
          ? { status: { name: body.status } }
          : { select: { name: body.status } };
      }
    }

    if (Object.keys(props).length === 0) {
      return NextResponse.json({ error: 'No valid properties to update' }, { status: 400 });
    }

    await updatePage(id, props);
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
