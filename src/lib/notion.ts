import { Client } from '@notionhq/client';
import { getNotionSessionFromRequest } from './notion-session';

// ---------------------------------------------------------------------------
// Client initialisation — gracefully handles missing API key
// ---------------------------------------------------------------------------

const envApiKey = process.env.NOTION_API_KEY;
const NOTION_LEGACY_VERSION = '2022-06-28';
const NOTION_CURRENT_VERSION = '2026-03-11';

export const notionClient: Client | null = envApiKey
  ? new Client({ auth: envApiKey })
  : null;

export function getRequestApiKey(input?: Request | string | null): string | null {
  if (typeof input === 'string') return input.trim() || null;
  if (input == null) return envApiKey || null;
  if (input?.headers?.get('x-nm-demo-mode') === '1') return null;
  const headerToken = input?.headers?.get('x-nm-notion-token')?.trim();
  if (headerToken) return headerToken;
  return getNotionSessionFromRequest(input)?.accessToken || null;
}

function getNotionClient(authToken?: string | null): Client | null {
  const token = authToken || envApiKey;
  return token ? new Client({ auth: token }) : null;
}

export function isNotionEnabled(input?: Request | string | null): boolean {
  if (arguments.length === 0) return envApiKey !== null;
  if (typeof input === 'string') return input.trim().length > 0;
  if (input == null) return false;
  return getRequestApiKey(input) !== null;
}

// ---------------------------------------------------------------------------
// Database IDs
// ---------------------------------------------------------------------------

export { DB_IDS } from './db-ids';

// ---------------------------------------------------------------------------
// Low-level helpers
// ---------------------------------------------------------------------------

/**
 * Query a Notion database (data source in v5 SDK). Returns the raw page objects array.
 */
export async function queryDatabase(
  dbId: string,
  filter?: Record<string, unknown>,
  sorts?: Array<Record<string, unknown>>,
  authToken?: string | null,
): Promise<any[]> {
  const token = authToken || envApiKey;
  if (!token) return [];

  const body: Record<string, unknown> = {};
  if (filter) body.filter = filter;
  body.sorts = sorts ?? [{ timestamp: 'last_edited_time', direction: 'descending' }];
  body.page_size = 100;

  const endpoints = [
    { url: `https://api.notion.com/v1/data_sources/${dbId}/query`, version: NOTION_CURRENT_VERSION },
    { url: `https://api.notion.com/v1/databases/${dbId}/query`, version: NOTION_LEGACY_VERSION },
  ];

  let lastError: unknown = null;
  for (const endpoint of endpoints) {
    const res = await fetch(endpoint.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': endpoint.version,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return data.results ?? [];
    }

    const err = await res.json().catch(() => ({}));
    lastError = err?.message || `Notion query failed: ${res.status}`;
  }

  throw new Error(String(lastError || 'Notion query failed'));
}

/**
 * Update a Notion page's properties.
 */
export async function updatePage(
  pageId: string,
  properties: Record<string, unknown>,
  authToken?: string | null,
): Promise<void> {
  const client = getNotionClient(authToken);
  if (!client) return;
  await client.pages.update({ page_id: pageId, properties: properties as any });
}

/**
 * Search across Notion workspace.
 */
export async function searchNotion(query: string, authToken?: string | null): Promise<any[]> {
  const client = getNotionClient(authToken);
  if (!client) return [];
  const response = await client.search({ query });
  return response.results;
}

async function notionRest(
  path: string,
  token: string,
  version = NOTION_CURRENT_VERSION,
  init: RequestInit = {},
) {
  return fetch(`https://api.notion.com/v1/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': version,
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
}

async function searchAll(
  token: string,
  filter: { property: 'object'; value: string },
  version: string,
  opts: { maxResults?: number } = {},
): Promise<any[]> {
  const results: any[] = [];
  let cursor: string | undefined;
  do {
    const res = await notionRest('search', token, version, {
      method: 'POST',
      body: JSON.stringify({
        filter,
        page_size: 100,
        start_cursor: cursor,
        sort: { timestamp: 'last_edited_time', direction: 'descending' },
      }),
    });
    if (!res.ok) throw new Error(`Notion search failed: ${res.status}`);
    const data = await res.json();
    results.push(...(data.results ?? []));
    if (opts.maxResults && results.length >= opts.maxResults) {
      return results.slice(0, opts.maxResults);
    }
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return results;
}

function databaseTitle(item: any): string {
  if (Array.isArray(item.title)) {
    const title = item.title.map((t: any) => t.plain_text).join('').trim();
    if (title) return title;
  }
  if (item.child_database?.title) return item.child_database.title;
  return '(이름 없음)';
}

function normalizeNotionId(id: string | null | undefined): string {
  return typeof id === 'string' ? id.replace(/-/g, '').toLowerCase() : '';
}

function databaseCanonicalKey(item: any): string {
  const canonicalId =
    item?.database_parent?.database_id ??
    item?.parent?.database_id ??
    item?.parent?.data_source_id ??
    item?.id;
  return normalizeNotionId(canonicalId);
}

function databaseSourceRank(item: any): number {
  const source = item?.source ?? item?.object;
  if (source === 'data_source') return 3;
  if (source === 'database') return 2;
  if (source === 'child_database') return 1;
  return 0;
}

function chooseDatabaseCandidate(current: any, next: any): any {
  const currentRank = databaseSourceRank(current);
  const nextRank = databaseSourceRank(next);
  if (nextRank !== currentRank) return nextRank > currentRank ? next : current;

  const currentHasMedia = Boolean(current?.icon || current?.cover || current?.url);
  const nextHasMedia = Boolean(next?.icon || next?.cover || next?.url);
  if (nextHasMedia !== currentHasMedia) return nextHasMedia ? next : current;

  const currentEdited = Date.parse(current?.last_edited_time ?? '') || 0;
  const nextEdited = Date.parse(next?.last_edited_time ?? '') || 0;
  return nextEdited > currentEdited ? next : current;
}

async function collectChildDatabases(token: string): Promise<any[]> {
  const pages = await searchAll(token, { property: 'object', value: 'page' }, NOTION_CURRENT_VERSION, { maxResults: 40 })
    .catch(() => []);
  const out: any[] = [];

  async function childrenOf(blockId: string): Promise<any[]> {
    const children: any[] = [];
    let cursor: string | undefined;
    do {
      const query = new URLSearchParams({ page_size: '100' });
      if (cursor) query.set('start_cursor', cursor);
      const res = await notionRest(`blocks/${blockId}/children?${query.toString()}`, token, NOTION_CURRENT_VERSION);
      if (!res.ok) return children;
      const data = await res.json();
      children.push(...(data.results ?? []));
      cursor = data.has_more ? data.next_cursor : undefined;
    } while (cursor);
    return children;
  }

  const concurrency = 5;
  for (let i = 0; i < pages.length; i += concurrency) {
    const batch = pages.slice(i, i + concurrency);
    await Promise.all(batch.map(async (page: any) => {
      const blocks = await childrenOf(page.id);
      for (const block of blocks) {
        if (block.type === 'child_database') {
          out.push({
            object: 'database',
            id: block.id,
            title: [{ plain_text: block.child_database?.title || '(이름 없음)' }],
            icon: null,
            cover: null,
            url: null,
            last_edited_time: block.last_edited_time ?? null,
            source: 'child_database',
          });
        }
      }
    }));
  }
  return out;
}

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise
      .then((value) => resolve(value))
      .catch(() => resolve(fallback))
      .finally(() => clearTimeout(timer));
  });
}

export async function listDatabases(authToken?: string | null): Promise<any[]> {
  const token = authToken || envApiKey;
  if (!token) return [];

  const [legacyDatabases, dataSources, childDatabases] = await Promise.all([
    searchAll(token, { property: 'object', value: 'database' }, NOTION_LEGACY_VERSION).catch(() => []),
    searchAll(token, { property: 'object', value: 'data_source' }, NOTION_CURRENT_VERSION).catch(() => []),
    withTimeout(collectChildDatabases(token), 3500, []),
  ]);

  const byId = new Map<string, any>();
  for (const item of [...legacyDatabases, ...dataSources, ...childDatabases]) {
    const title = databaseTitle(item);
    if (!item?.id || !title || title === '(이름 없음)') continue;
    const key = databaseCanonicalKey(item) || normalizeNotionId(item.id);
    if (!key) continue;
    const current = byId.get(key);
    byId.set(key, current ? chooseDatabaseCandidate(current, item) : item);
  }
  return Array.from(byId.values());
}

export async function getDatabaseSchema(dbId: string, authToken?: string | null): Promise<Record<string, any> | null> {
  const token = authToken || envApiKey;
  if (!token) return null;

  const endpoints = [
    { path: `data_sources/${dbId}`, version: NOTION_CURRENT_VERSION },
    { path: `databases/${dbId}`, version: NOTION_LEGACY_VERSION },
  ];

  for (const endpoint of endpoints) {
    const res = await notionRest(endpoint.path, token, endpoint.version);
    if (res.ok) {
      const data = await res.json();
      return data.properties ?? null;
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Property extraction helpers
// ---------------------------------------------------------------------------

type PropertyType =
  | 'title'
  | 'rich_text'
  | 'select'
  | 'multi_select'
  | 'checkbox'
  | 'date'
  | 'number'
  | 'status'
  | 'url';

/**
 * Safely extract a typed value from a Notion page property.
 * Property names in Notion workspaces can vary (Korean / English),
 * so callers should try multiple candidate names.
 */
export function getPropertyValue(
  page: any,
  propertyName: string,
  type: PropertyType,
): any {
  const prop = page.properties?.[propertyName];
  if (!prop) return undefined;

  switch (type) {
    case 'title': {
      const items = prop.title as Array<{ plain_text: string }> | undefined;
      return items?.map((t) => t.plain_text).join('') ?? '';
    }
    case 'rich_text': {
      const items = prop.rich_text as Array<{ plain_text: string }> | undefined;
      return items?.map((t) => t.plain_text).join('') ?? '';
    }
    case 'select':
      return prop.select ?? null;
    case 'multi_select':
      return (prop.multi_select as Array<{ name: string; color: string }>) ?? [];
    case 'checkbox':
      return prop.checkbox ?? false;
    case 'date':
      return prop.date?.start ?? null;
    case 'number':
      return prop.number ?? 0;
    case 'status':
      return prop.status ?? null;
    case 'url':
      return prop.url ?? null;
    default:
      return undefined;
  }
}

/**
 * Try multiple candidate property names and return the first match.
 */
export function getPropertyValueMulti(
  page: any,
  candidates: string[],
  type: PropertyType,
): any {
  for (const name of candidates) {
    const val = getPropertyValue(page, name, type);
    if (val !== undefined && val !== '' && val !== null) return val;
  }
  // Return a sensible default based on type
  switch (type) {
    case 'title':
    case 'rich_text':
      return '';
    case 'checkbox':
      return false;
    case 'number':
      return 0;
    case 'date':
    case 'select':
    case 'status':
    case 'url':
      return null;
    case 'multi_select':
      return [];
    default:
      return undefined;
  }
}

/**
 * Build a Notion page URL from a page id.
 */
export function pageUrl(pageId: string): string {
  return `https://notion.so/${pageId.replace(/-/g, '')}`;
}

// ---------------------------------------------------------------------------
// CRUD helpers
// ---------------------------------------------------------------------------

/**
 * Create a new page in a database.
 */
export async function createPage(dbId: string, properties: Record<string, unknown>, authToken?: string | null): Promise<string | null> {
  const token = authToken || envApiKey;
  if (!token) return null;

  const parents = [
    { type: 'data_source_id', data_source_id: dbId },
    { type: 'database_id', database_id: dbId },
  ];

  let lastError: unknown = null;
  for (const parent of parents) {
    const res = await notionRest('pages', token, NOTION_CURRENT_VERSION, {
      method: 'POST',
      body: JSON.stringify({ parent, properties }),
    });
    if (res.ok) {
      const data = await res.json();
      return data.id ?? null;
    }
    const err = await res.json().catch(() => ({}));
    lastError = err?.message || `Notion create page failed: ${res.status}`;
  }
  throw new Error(String(lastError || 'Notion create page failed'));
}

/**
 * Archive (soft-delete) a page.
 */
export async function archivePage(pageId: string, authToken?: string | null): Promise<void> {
  const client = getNotionClient(authToken);
  if (!client) return;
  await (client as any).pages.update({
    page_id: pageId,
    archived: true,
  });
}

/**
 * Get page blocks (content).
 */
export async function getPageBlocks(pageId: string, authToken?: string | null): Promise<any[]> {
  const client = getNotionClient(authToken);
  if (!client) return [];
  const response = await (client as any).blocks.children.list({
    block_id: pageId,
    page_size: 100,
  });
  return response.results;
}

/**
 * Append blocks to a page.
 */
export async function appendBlocks(pageId: string, children: any[], authToken?: string | null): Promise<void> {
  const client = getNotionClient(authToken);
  if (!client) return;
  await (client as any).blocks.children.append({
    block_id: pageId,
    children,
  });
}

/**
 * Get a single page.
 */
export async function getPage(pageId: string, authToken?: string | null): Promise<any | null> {
  const client = getNotionClient(authToken);
  if (!client) return null;
  return await (client as any).pages.retrieve({ page_id: pageId });
}

/**
 * Update a single block. Accepts partial block payload keyed by type, e.g.
 *   { paragraph: { rich_text: [{ type: 'text', text: { content: '...' } }] } }
 *   { to_do: { checked: true } }
 * Uses REST directly to avoid SDK v5 routing pitfalls (see MEMORY).
 */
export async function updateBlock(blockId: string, payload: Record<string, unknown>, authToken?: string | null): Promise<void> {
  const token = authToken || envApiKey;
  if (!token) return;
  const res = await fetch(`https://api.notion.com/v1/blocks/${blockId}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Notion updateBlock failed ${res.status}: ${text.slice(0, 200)}`);
  }
}
