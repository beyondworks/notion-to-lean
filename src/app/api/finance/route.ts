import { NextResponse } from 'next/server';
import type { FinanceEntry } from '@/lib/types';
import {
  isNotionEnabled,
  getRequestApiKey,
  getDatabaseSchema,
  queryDatabase,
  getPropertyValueMulti,
  pageUrl,
  DB_IDS,
  createPage,
} from '@/lib/notion';
import { getDbMappingFromRequest } from '@/lib/notion-session';

// ---------------------------------------------------------------------------
// Map a Notion page -> FinanceEntry
// ---------------------------------------------------------------------------
function pageToFinance(page: any): FinanceEntry {
  const client = getPropertyValueMulti(
    page,
    ['Entry', 'Entry name', 'Name', '이름', 'Title', '제목', '클라이언트', 'Client', '항목'],
    'title',
  );

  const typeSelect = getPropertyValueMulti(
    page,
    ['Type', '유형', '분류', 'Category', '구분'],
    'select',
  );
  const typeName = (typeSelect?.name ?? '').toLowerCase();
  const isExpense =
    typeName === '지출' ||
    typeName === 'expense' ||
    typeName === '비용';
  const type: 'income' | 'expense' = isExpense ? 'expense' : 'income';

  const amount = getPropertyValueMulti(
    page,
    ['Amount', '금액', '액수', 'Price', '가격'],
    'number',
  );

  const date = getPropertyValueMulti(
    page,
    ['Date', '날짜', '일자', 'Due', '마감'],
    'date',
  );

  return {
    id: page.id,
    client: client || '(항목 없음)',
    type,
    amount: Math.abs(amount),
    date,
    notionUrl: pageUrl(page.id),
  };
}

// ---------------------------------------------------------------------------
// GET /api/finance
// ---------------------------------------------------------------------------
export async function GET(request: Request) {
  const token = getRequestApiKey(request);
  const { searchParams } = new URL(request.url);
  const mapping = getDbMappingFromRequest(request);
  const dbId = searchParams.get('dbId') || mapping.finance || DB_IDS.TIMELINE;

  if (!isNotionEnabled(token)) {
    return NextResponse.json({ data: [], mock: false });
  }

  try {
    // 타임라인 DB는 필수, 예정 수입/지출 DB는 선택 (미공유 시 무시)
    const timelinePages = await queryDatabase(dbId, undefined, undefined, token);
    let scheduledPages: any[] = [];
    if (dbId === DB_IDS.TIMELINE) {
      try {
        scheduledPages = await queryDatabase(DB_IDS.SCHEDULED_FINANCE, undefined, undefined, token);
      } catch {
        // 예정 수입/지출 DB 미공유 — 무시
      }
    }

    const data: FinanceEntry[] = [
      ...timelinePages.map(pageToFinance),
      ...scheduledPages.map(pageToFinance),
    ];

    return NextResponse.json({ data, mock: false });
  } catch (err) {
    console.warn('[finance GET]', err instanceof Error ? err.message : err);
    return NextResponse.json({ data: [], mock: false, error: 'query failed' });
  }
}

// ---------------------------------------------------------------------------
// POST /api/finance — create a timeline entry with type/amount/date/memo
// Auto-discovers property names via Notion DB schema to survive renames.
// ---------------------------------------------------------------------------
function findProp(
  schema: Record<string, any>,
  candidates: string[],
  type: string,
): string | null {
  // Prefer exact name match first, then first-of-type match
  for (const c of candidates) {
    if (schema[c] && schema[c].type === type) return c;
  }
  for (const [name, def] of Object.entries(schema)) {
    if ((def as any).type === type) return name;
  }
  return null;
}

export async function POST(request: Request) {
  let body: {
    title?: string;
    type?: '수입' | '지출' | string;
    amount?: number;
    date?: string; // ISO yyyy-mm-dd
    memo?: string;
    dbId?: string;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.title || !body.type || body.amount == null) {
    return NextResponse.json(
      { error: 'title, type (수입|지출), and amount are required' },
      { status: 400 },
    );
  }
  if (typeof body.amount !== 'number' || body.amount <= 0) {
    return NextResponse.json({ error: 'amount must be a positive number' }, { status: 400 });
  }

  const token = getRequestApiKey(request);
  const mapping = getDbMappingFromRequest(request);
  const dbId = body.dbId || mapping.finance || DB_IDS.TIMELINE;

  if (!isNotionEnabled(token)) {
    return NextResponse.json({ error: 'Notion connection required' }, { status: 401 });
  }

  try {
    const schema = await getDatabaseSchema(dbId, token);
    if (!schema) {
      return NextResponse.json({ error: 'Failed to read DB schema' }, { status: 500 });
    }
    const titleKey = findProp(schema, ['Entry', 'Entry name', 'Name', 'Title', '제목', '이름', '항목'], 'title');
    const typeKey = findProp(schema, ['Type', '유형', '분류', '구분'], 'select');
    const amountKey = findProp(schema, ['Amount', '금액', '액수'], 'number');
    const dateKey = findProp(schema, ['Date', '날짜', '일자'], 'date');
    const memoKey = findProp(schema, ['Memo', '메모', 'Description', '설명'], 'rich_text');

    if (!titleKey || !typeKey || !amountKey) {
      return NextResponse.json(
        { error: 'Required properties not found', schemaKeys: Object.keys(schema) },
        { status: 500 },
      );
    }

    // Validate type option exists
    const typeOption = (schema[typeKey]?.select?.options ?? []).find(
      (o: any) => o.name === body.type,
    );
    if (!typeOption) {
      const available = (schema[typeKey]?.select?.options ?? []).map((o: any) => o.name);
      return NextResponse.json(
        { error: `Type '${body.type}' not in options`, available },
        { status: 400 },
      );
    }

    const properties: Record<string, unknown> = {
      [titleKey]: { title: [{ text: { content: body.title } }] },
      [typeKey]: { select: { name: body.type } },
      [amountKey]: { number: body.amount },
    };
    if (dateKey && body.date) {
      properties[dateKey] = { date: { start: body.date } };
    }
    if (memoKey && body.memo) {
      properties[memoKey] = { rich_text: [{ text: { content: body.memo } }] };
    }

    const pageId = await createPage(dbId, properties, token);
    if (!pageId) {
      return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 });
    }

    return NextResponse.json(
      { id: pageId, url: pageUrl(pageId), mock: false },
      { status: 201 },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[finance POST]', message);
    return NextResponse.json({ error: 'Failed', detail: message }, { status: 500 });
  }
}
