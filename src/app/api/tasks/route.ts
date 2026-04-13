import { NextResponse } from 'next/server';
import type { Task } from '@/lib/types';
import {
  isNotionEnabled,
  queryDatabase,
  updatePage,
  getPropertyValueMulti,
  pageUrl,
  DB_IDS,
} from '@/lib/notion';
import { MOCK_TASKS } from '@/lib/mock-data';

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
  const title = getPropertyValueMulti(page, ['Name', '이름', 'Title', '제목', '태스크'], 'title');
  const selectVal = getPropertyValueMulti(page, ['Category', '분류', '카테고리', 'Type', '유형'], 'select');
  const done = getPropertyValueMulti(page, ['Done', '완료', 'Checkbox', '체크박스', 'Status Check'], 'checkbox');
  const dueDate = getPropertyValueMulti(page, ['Due', '마감', 'Date', '날짜', '마감일', 'Due Date'], 'date');

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
export async function GET() {
  if (!isNotionEnabled()) {
    return NextResponse.json({ data: MOCK_TASKS, mock: true });
  }

  try {
    const pages = await queryDatabase(DB_IDS.TASKS, undefined, [
      { property: 'Done', direction: 'ascending' } as any,
    ]);
    const data: Task[] = pages.map(pageToTask);
    return NextResponse.json({ data, mock: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch tasks', detail: message },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// POST /api/tasks  — toggle done checkbox
// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  let body: { id?: string; done?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (typeof body.id !== 'string' || typeof body.done !== 'boolean') {
    return NextResponse.json(
      { error: 'Body must include { id: string, done: boolean }' },
      { status: 400 },
    );
  }

  if (!isNotionEnabled()) {
    return NextResponse.json({ success: true, mock: true });
  }

  try {
    // Try common property names for the checkbox
    const propertyNames = ['Done', '완료', 'Checkbox', '체크박스', 'Status Check'];
    let updated = false;

    for (const name of propertyNames) {
      try {
        await updatePage(body.id, { [name]: { checkbox: body.done } });
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
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update task', detail: message },
      { status: 500 },
    );
  }
}
