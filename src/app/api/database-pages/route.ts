import { NextResponse } from 'next/server';
import {
  getDatabaseSchema,
  getRequestApiKey,
  isNotionEnabled,
  listDatabases,
  listDatabaseViews,
  pageUrl,
  queryDatabase,
  queryView,
} from '@/lib/notion';

export const dynamic = 'force-dynamic';

type GenericProperty = {
  name: string;
  type: string;
  text: string;
  value?: unknown;
  color?: string | null;
};

function plainText(list: any[] | undefined): string {
  return Array.isArray(list) ? list.map((t) => t?.plain_text ?? '').join('') : '';
}

function titlePropertyName(schema: Record<string, any> | null): string | null {
  if (!schema) return null;
  for (const [name, def] of Object.entries(schema)) {
    if ((def as any)?.type === 'title') return name;
  }
  return null;
}

function propertySummary(name: string, prop: any): GenericProperty {
  const type = prop?.type ?? 'unknown';
  const base = { name, type };
  switch (type) {
    case 'title':
      return { ...base, text: plainText(prop.title), value: plainText(prop.title) };
    case 'rich_text':
      return { ...base, text: plainText(prop.rich_text), value: plainText(prop.rich_text) };
    case 'select':
      return { ...base, text: prop.select?.name ?? '', value: prop.select?.name ?? null, color: prop.select?.color ?? null };
    case 'status':
      return { ...base, text: prop.status?.name ?? '', value: prop.status?.name ?? null, color: prop.status?.color ?? null };
    case 'multi_select': {
      const values = Array.isArray(prop.multi_select) ? prop.multi_select.map((v: any) => v?.name).filter(Boolean) : [];
      return { ...base, text: values.join(', '), value: values };
    }
    case 'checkbox':
      return { ...base, text: prop.checkbox ? 'Checked' : '', value: !!prop.checkbox };
    case 'date':
      return { ...base, text: prop.date?.start ?? '', value: prop.date ?? null };
    case 'number':
      return { ...base, text: prop.number === null || prop.number === undefined ? '' : String(prop.number), value: prop.number ?? null };
    case 'url':
      return { ...base, text: prop.url ?? '', value: prop.url ?? null };
    case 'email':
      return { ...base, text: prop.email ?? '', value: prop.email ?? null };
    case 'phone_number':
      return { ...base, text: prop.phone_number ?? '', value: prop.phone_number ?? null };
    case 'people': {
      const values = Array.isArray(prop.people) ? prop.people.map((p: any) => p?.name || p?.person?.email).filter(Boolean) : [];
      return { ...base, text: values.join(', '), value: values };
    }
    case 'relation': {
      const count = Array.isArray(prop.relation) ? prop.relation.length : 0;
      return { ...base, text: count ? `${count} relation${count === 1 ? '' : 's'}` : '', value: prop.relation ?? [] };
    }
    case 'files': {
      const values = Array.isArray(prop.files) ? prop.files.map((f: any) => f?.name).filter(Boolean) : [];
      return { ...base, text: values.join(', '), value: values };
    }
    case 'formula': {
      const formula = prop.formula ?? {};
      const value = formula[formula.type];
      return { ...base, text: value === null || value === undefined ? '' : String(value), value };
    }
    case 'rollup': {
      const rollup = prop.rollup ?? {};
      const value = rollup[rollup.type];
      return { ...base, text: value === null || value === undefined ? '' : String(value), value };
    }
    default:
      return { ...base, text: '', value: null };
  }
}

function schemaSummary(schema: Record<string, any> | null) {
  return Object.entries(schema ?? {}).map(([name, def]: [string, any]) => {
    const type = def?.type ?? 'unknown';
    const config = def?.[type] ?? {};
    const options = Array.isArray(config.options)
      ? config.options.map((opt: any) => ({ id: opt.id, name: opt.name, color: opt.color ?? null }))
      : [];
    return {
      name,
      type,
      options,
      format: config.format ?? null,
      relationDatabaseId: config.database_id ?? config.data_source_id ?? null,
    };
  });
}

function pageToGeneric(page: any, schema: Record<string, any> | null) {
  const titleKey = titlePropertyName(schema);
  const summaries = Object.entries(page.properties ?? {}).map(([name, prop]) => propertySummary(name, prop));
  const title =
    (titleKey && summaries.find((p) => p.name === titleKey)?.text) ||
    summaries.find((p) => p.type === 'title')?.text ||
    '(제목 없음)';
  const preview = summaries
    .filter((p) => p.type !== 'title' && p.text)
    .slice(0, 6);
  const category =
    summaries.find((p) => ['status', 'select'].includes(p.type) && p.text)?.text ||
    summaries.find((p) => p.type === 'multi_select' && p.text)?.text ||
    '';

  return {
    id: page.id,
    title,
    category,
    preview,
    properties: summaries,
    createdAt: page.created_time ?? null,
    lastEditedAt: page.last_edited_time ?? null,
    notionUrl: page.url ?? pageUrl(page.id),
  };
}

function clampLimit(value: string | null): number {
  if (value === null || value.trim() === '') return 80;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 80;
  return Math.min(Math.max(Math.floor(parsed), 1), 100);
}

function genericSearchText(item: ReturnType<typeof pageToGeneric>): string {
  const preview = Array.isArray(item.preview)
    ? item.preview.map((prop) => `${prop.name} ${prop.text}`).join(' ')
    : '';
  return `${item.title} ${item.category} ${preview}`.toLowerCase();
}

function normalizeNotionId(id: unknown): string {
  return typeof id === 'string' ? id.replace(/-/g, '').toLowerCase() : '';
}

async function resolveQueryableDatabaseId(dbId: string, token: string | null): Promise<string | null> {
  if (!token) return null;
  const target = normalizeNotionId(dbId);
  if (!target) return null;
  const rows = await listDatabases(token).catch(() => []);
  for (const row of rows) {
    const rowId = normalizeNotionId(row?.id);
    const parentDatabaseId =
      row?.database_parent?.database_id ??
      row?.parent?.database_id ??
      row?.parent?.data_source_id ??
      null;
    if (rowId === target && parentDatabaseId && normalizeNotionId(parentDatabaseId) !== target) {
      return parentDatabaseId;
    }
  }
  return null;
}

export async function GET(request: Request) {
  const token = getRequestApiKey(request);
  const { searchParams } = new URL(request.url);
  const dbId = searchParams.get('dbId');
  const viewId = searchParams.get('viewId');
  const q = (searchParams.get('q') ?? '').trim();
  const limit = clampLimit(searchParams.get('limit'));

  if (!dbId) {
    return NextResponse.json({ error: 'dbId is required' }, { status: 400 });
  }

  if (!isNotionEnabled(token)) {
    return NextResponse.json({ data: [], schema: [], mock: false });
  }

  try {
    const [schema, views] = await Promise.all([
      getDatabaseSchema(dbId, token),
      listDatabaseViews(dbId, token).catch(() => []),
    ]);
    const titleKey = titlePropertyName(schema);
    const searchFilter = q && titleKey
      ? { property: titleKey, title: { contains: q } }
      : undefined;
    let pages = await (viewId ? queryView(viewId, token).catch(() => []) : Promise.resolve([]));
    if (!pages.length || pages.some((page) => !page?.properties)) {
      pages = await queryDatabase(dbId, searchFilter, undefined, token);
      if (pages.length <= 1) {
        const queryableDbId = await resolveQueryableDatabaseId(dbId, token);
        if (queryableDbId) {
          const parentPages = await queryDatabase(queryableDbId, searchFilter, undefined, token).catch(() => []);
          if (parentPages.length > pages.length) pages = parentPages;
        }
      }
      if (pages.length <= 1 && titleKey) {
        const titleSortedPages = await queryDatabase(
          dbId,
          searchFilter,
          [{ property: titleKey, direction: 'ascending' }],
          token,
        ).catch(() => []);
        if (titleSortedPages.length > pages.length) pages = titleSortedPages;
      }
      if (pages.length <= 1) {
        const sortableProps = schemaSummary(schema)
          .filter((prop) => ['checkbox', 'date', 'number', 'select', 'status', 'title'].includes(prop.type))
          .filter((prop) => prop.name !== titleKey)
          .slice(0, 8);
        for (const prop of sortableProps) {
          const sortedPages = await queryDatabase(
            dbId,
            searchFilter,
            [{ property: prop.name, direction: 'ascending' }],
            token,
          ).catch(() => []);
          if (sortedPages.length > pages.length) pages = sortedPages;
          if (pages.length > 1) break;
        }
      }
    }
    let data = pages.map((page) => pageToGeneric(page, schema));
    if (q) {
      const normalizedQuery = q.toLowerCase();
      data = data.filter((item) => genericSearchText(item).includes(normalizedQuery));
    }
    return NextResponse.json({
      data: data.slice(0, limit),
      schema: schemaSummary(schema),
      views,
      selectedViewId: viewId || null,
      query: q,
      limit,
      mock: false,
    });
  } catch (err) {
    console.warn('[database-pages]', err instanceof Error ? err.message : err);
    return NextResponse.json({ data: [], schema: [], mock: false, error: 'query failed' });
  }
}
