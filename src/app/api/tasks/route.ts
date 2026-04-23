import { NextResponse } from 'next/server';
import type { Task } from '@/lib/types';
import {
  isNotionEnabled,
  getRequestApiKey,
  queryDatabase,
  updatePage,
  createPage,
  getPropertyValueMulti,
  pageUrl,
  DB_IDS,
} from '@/lib/notion';
import { getDbMappingFromRequest } from '@/lib/notion-session';

// ---------------------------------------------------------------------------
// Notion color name -> CSS class-friendly color name
// ---------------------------------------------------------------------------
const NOTION_COLOR_MAP: Record<string, string> = {
  default: 'gray',
  gray: 'gray',
  brown: 'brown',
  orange: 'orange',
  yellow: 'yellow',
  green: 'green',
  blue: 'blue',
  purple: 'purple',
  pink: 'pink',
  red: 'red',
};

function mapNotionColor(color?: string): string {
  return NOTION_COLOR_MAP[color ?? 'default'] ?? 'gray';
}

// ---------------------------------------------------------------------------
// Map a Notion page -> Task
// ---------------------------------------------------------------------------
function pageToTask(page: any): Task {
  const title = getPropertyValueMulti(page, ['Entry name', 'Name', '이름', 'Title', '제목', '태스크'], 'title');
  const selectVal = getPropertyValueMulti(page, ['Category', '분류', '카테고리', 'Type', '유형'], 'select');
  const done = getPropertyValueMulti(page, ['Completed', 'Done', '완료', 'Checkbox', '체크박스', 'Status Check'], 'checkbox');
  const dueDate = getPropertyValueMulti(page, ['Date', 'Due', '마감', '날짜', '마감일', 'Due Date'], 'date');

  return {
    id: page.id,
    title: title || '(제목 없음)',
    category: selectVal?.name ?? '',
    categoryColor: mapNotionColor(selectVal?.color),
    dueDate: dueDate,
    done: Boolean(done),
    notionUrl: pageUrl(page.id),
  };
}

// ---------------------------------------------------------------------------
// GET /api/tasks
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const token = getRequestApiKey(request);
  const { searchParams } = new URL(request.url);
  const mapping = getDbMappingFromRequest(request);
  const dbId = searchParams.get('dbId') || mapping.tasks || DB_IDS.TASKS;

  if (!isNotionEnabled(token)) {
    return NextResponse.json({ data: [], mock: false });
  }

  try {
    const sortByCompleted =
      dbId === DB_IDS.TASKS ? [{ property: 'Completed', direction: 'ascending' } as any] : undefined;
    const pages = await queryDatabase(dbId, undefined, sortByCompleted, token);
    const data: Task[] = pages.map(pageToTask);
    return NextResponse.json({ data, mock: false });
  } catch (err) {
    console.warn('[tasks GET]', err instanceof Error ? err.message : err);
    return NextResponse.json({ data: [], mock: false, error: 'query failed' });
  }
}

// ---------------------------------------------------------------------------
// POST /api/tasks  — action: 'toggle' (default) | 'create'
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  const token = getRequestApiKey(request);
  let body: { action?: string; id?: string; done?: boolean; title?: string; dbId?: string; properties?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const action = body.action ?? 'toggle';
  const mapping = getDbMappingFromRequest(request);

  // ---- CREATE ----
  if (action === 'create') {
    if (typeof body.title !== 'string' || !body.title.trim()) {
      return NextResponse.json({ error: 'title is required for create action' }, { status: 400 });
    }

    if (!isNotionEnabled(token)) {
      return NextResponse.json({ error: 'Notion connection required' }, { status: 401 });
    }

    try {
      const properties: Record<string, unknown> = {
        ...(body.properties ?? {}),
        Name: { title: [{ text: { content: body.title } }] },
      };

      const pageId = await createPage(body.dbId || mapping.tasks || DB_IDS.TASKS, properties, token);
      if (!pageId) {
        return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
      }

      return NextResponse.json(
        { id: pageId, url: pageUrl(pageId), mock: false },
        { status: 201 },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[tasks create]', message);
      return NextResponse.json({ error: 'Failed to create task', detail: message }, { status: 500 });
    }
  }

  // ---- TOGGLE (default) ----
  if (typeof body.id !== 'string' || typeof body.done !== 'boolean') {
    return NextResponse.json(
      { error: 'Body must include { id: string, done: boolean }' },
      { status: 400 },
    );
  }

  if (!isNotionEnabled(token)) {
    return NextResponse.json({ error: 'Notion connection required' }, { status: 401 });
  }

  try {
    // Try common property names for the checkbox (Beyond_Tasks uses "Completed")
    const propertyNames = ['Completed', 'Done', '완료', 'Checkbox', '체크박스', 'Status Check'];
    let updated = false;

    for (const name of propertyNames) {
      try {
        await updatePage(body.id, { [name]: { checkbox: body.done } }, token);
        updated = true;
        break;
      } catch {
        // Property name doesn't exist, try next
      }
    }

    if (!updated) {
      return NextResponse.json(
        { error: 'Could not find checkbox property on page' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, mock: false });
  } catch (err) {
    console.warn('[tasks POST]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}
