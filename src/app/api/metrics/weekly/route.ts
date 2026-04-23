import { NextResponse } from 'next/server';
import {
  isNotionEnabled,
  getRequestApiKey,
  queryDatabase,
  getPropertyValueMulti,
  DB_IDS,
} from '@/lib/notion';
import { getDbMappingFromRequest } from '@/lib/notion-session';
import type { Task } from '@/lib/types';

interface WeeklyMetrics {
  thisWeekDone: number;
  lastWeekDone: number;
  dailyDone: number[]; // last 7 days, index 0 = 6 days ago, index 6 = today
  todayDone: number;
  urgentCount: number;
  pendingCount: number;
}

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((startOfDay(a).getTime() - startOfDay(b).getTime()) / (1000 * 60 * 60 * 24));
}

function computeMetrics(tasks: Array<Task & { lastEditedAt?: string | null }>): WeeklyMetrics {
  const now = new Date();
  const today = startOfDay(now);
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - 6); // last 7 days inclusive
  const lastWeekStart = new Date(today);
  lastWeekStart.setDate(lastWeekStart.getDate() - 13);
  const lastWeekEnd = new Date(today);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 7);
  const threeDaysAhead = new Date(today);
  threeDaysAhead.setDate(threeDaysAhead.getDate() + 3);

  let thisWeekDone = 0;
  let lastWeekDone = 0;
  let todayDone = 0;
  let urgentCount = 0;
  let pendingCount = 0;
  const dailyDone = [0, 0, 0, 0, 0, 0, 0];

  for (const t of tasks) {
    if (!t.done) {
      pendingCount++;
      if (t.dueDate) {
        const due = new Date(t.dueDate);
        if (due <= threeDaysAhead) urgentCount++;
      }
      continue;
    }

    // done === true — bucket by completion proxy (lastEditedAt) or dueDate
    const stamp = t.lastEditedAt ?? t.dueDate;
    if (!stamp) continue;
    const when = startOfDay(new Date(stamp));

    if (when.getTime() === today.getTime()) todayDone++;

    if (when >= weekStart && when <= today) {
      thisWeekDone++;
      const offset = 6 - daysBetween(today, when);
      if (offset >= 0 && offset < 7) dailyDone[offset]++;
    } else if (when >= lastWeekStart && when < weekStart) {
      lastWeekDone++;
    }
  }

  return { thisWeekDone, lastWeekDone, dailyDone, todayDone, urgentCount, pendingCount };
}

function pageToTaskWithEdit(page: any): Task & { lastEditedAt?: string | null } {
  const title = getPropertyValueMulti(page, ['Entry name', 'Name', '이름', 'Title', '제목', '태스크'], 'title');
  const done = getPropertyValueMulti(page, ['Completed', 'Done', '완료', 'Checkbox', '체크박스', 'Status Check'], 'checkbox');
  const dueDate = getPropertyValueMulti(page, ['Date', 'Due', '마감', '날짜', '마감일', 'Due Date'], 'date');
  return {
    id: page.id,
    title: title || '(제목 없음)',
    category: '',
    categoryColor: 'gray',
    dueDate,
    done: Boolean(done),
    lastEditedAt: page.last_edited_time ?? null,
  } as Task & { lastEditedAt?: string | null };
}

export async function GET(request: Request) {
  const token = getRequestApiKey(request);
  const { searchParams } = new URL(request.url);
  const mapping = getDbMappingFromRequest(request);
  const dbId = searchParams.get('dbId') || mapping.tasks || DB_IDS.TASKS;

  if (!isNotionEnabled(token)) {
    return NextResponse.json({ data: computeMetrics([]), mock: false });
  }

  try {
    const pages = await queryDatabase(dbId, undefined, undefined, token);
    const tasks = pages.map(pageToTaskWithEdit);
    const metrics = computeMetrics(tasks);
    return NextResponse.json({ data: metrics, mock: false });
  } catch (err) {
    console.warn('[metrics weekly]', err instanceof Error ? err.message : err);
    return NextResponse.json({ data: computeMetrics([]), mock: false, error: 'query failed' });
  }
}
