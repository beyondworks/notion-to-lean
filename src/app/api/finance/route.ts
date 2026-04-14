import { NextResponse } from 'next/server';
import type { FinanceEntry } from '@/lib/types';
import {
  isNotionEnabled,
  queryDatabase,
  getPropertyValueMulti,
  pageUrl,
  DB_IDS,
} from '@/lib/notion';
import { MOCK_FINANCE } from '@/lib/mock-data';

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
export async function GET() {
  if (!isNotionEnabled()) {
    return NextResponse.json({ data: MOCK_FINANCE, mock: true });
  }

  try {
    // 타임라인 DB는 필수, 예정 수입/지출 DB는 선택 (미공유 시 무시)
    const timelinePages = await queryDatabase(DB_IDS.TIMELINE);
    let scheduledPages: any[] = [];
    try {
      scheduledPages = await queryDatabase(DB_IDS.SCHEDULED_FINANCE);
    } catch {
      // 예정 수입/지출 DB 미공유 — 무시
    }

    const data: FinanceEntry[] = [
      ...timelinePages.map(pageToFinance),
      ...scheduledPages.map(pageToFinance),
    ];

    return NextResponse.json({ data, mock: false });
  } catch (err) {
    console.warn('[notion fallback]', err instanceof Error ? err.message : err);
    return NextResponse.json({ data: MOCK_FINANCE, mock: true, fallback: true });
  }
}
