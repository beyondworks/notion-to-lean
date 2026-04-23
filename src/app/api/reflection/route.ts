import { NextResponse } from 'next/server';
import {
  isNotionEnabled,
  getRequestApiKey,
  queryDatabase,
  getPropertyValueMulti,
  pageUrl,
  DB_IDS,
} from '@/lib/notion';
import { getDbMappingFromRequest } from '@/lib/notion-session';

// ---------------------------------------------------------------------------
// GET /api/reflection — Reflection (스크립트) database
// ---------------------------------------------------------------------------
function pageToReflection(page: any) {
  const title = getPropertyValueMulti(
    page,
    ['Name', 'Entry name', '이름', 'Title', '제목'],
    'title',
  );
  const description = getPropertyValueMulti(
    page,
    ['Description', '설명', '내용', 'Summary', '요약'],
    'rich_text',
  );
  const categorySelect = getPropertyValueMulti(
    page,
    ['Category', '분류', '카테고리', 'Type', '유형'],
    'select',
  );
  const category = categorySelect?.name ?? '';

  return {
    id: page.id,
    title: title || '(제목 없음)',
    description,
    category,
    createdAt: page.created_time ?? null,
    lastEditedAt: page.last_edited_time || null,
    notionUrl: pageUrl(page.id),
  };
}

export async function GET(request: Request) {
  const token = getRequestApiKey(request);
  const { searchParams } = new URL(request.url);
  const mapping = getDbMappingFromRequest(request);
  const dbId = searchParams.get('dbId') || mapping.reflection || DB_IDS.REFLECTION;

  if (!isNotionEnabled(token)) {
    return NextResponse.json({ data: [], mock: false });
  }

  try {
    const pages = await queryDatabase(dbId, undefined, undefined, token);
    const data = pages.map(pageToReflection);
    return NextResponse.json({ data, mock: false });
  } catch (err) {
    console.warn('[reflection GET]', err instanceof Error ? err.message : err);
    return NextResponse.json({ data: [], mock: false, error: 'query failed' });
  }
}
