import { Client } from '@notionhq/client';

// ---------------------------------------------------------------------------
// Client initialisation — gracefully handles missing API key
// ---------------------------------------------------------------------------

const apiKey = process.env.NOTION_API_KEY;

export const notionClient: Client | null = apiKey
  ? new Client({ auth: apiKey })
  : null;

export function isNotionEnabled(): boolean {
  return notionClient !== null;
}

// ---------------------------------------------------------------------------
// Database IDs
// ---------------------------------------------------------------------------

export const DB_IDS = {
  TASKS: '242003c7-f7be-804a-9d6e-f76d5d0347b4',
  TIMELINE: '28f003c7-f7be-8080-85b4-d73efe3cb896',
  SCHEDULED_FINANCE: '15007d59-2e5f-4b88-85a3-95fb4c77b90a',
  INSIGHTS: '241003c7-f7be-800b-b71c-df3acddc5bb8',
  WORKS: '241003c7-f7be-8011-8ba4-cecf131df2a0',
  PARENT_TASK: '242003c7-f7be-806b-a177-e8372eaa64a4',
  // Insights sub-DBs
  INSIGHTS_AI: '241003c7-f7be-800f-8f07-f95918c3a072',
  INSIGHTS_CLAUDE_CODE: '2fd003c7-f7be-80cb-90d3-dbecc15c507f',
  INSIGHTS_SCRAP: '247003c7-f7be-80c0-a9f4-cddbcd337415',
  INSIGHTS_DESIGN: '241003c7-f7be-804f-a021-fc24777ca9ad',
  INSIGHTS_BRANDING: '247003c7-f7be-803a-83f5-fd9494d24d62',
  INSIGHTS_BUILD: '247003c7-f7be-8074-a583-e1638fd3cfed',
  INSIGHTS_MARKETING: '247003c7-f7be-8035-83f4-d39480d66503',
  REFLECTION: '31e003c7-f7be-80a0-ab4f-c1e2249f3c24',
} as const;

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
): Promise<any[]> {
  if (!apiKey) return [];

  // Use REST API directly — SDK v5's dataSources.query hits a different endpoint
  const body: Record<string, unknown> = {};
  if (filter) body.filter = filter;
  // Default sort: newest edited first (so all DB views are date-desc consistently)
  body.sorts = sorts ?? [{ timestamp: 'last_edited_time', direction: 'descending' }];
  body.page_size = 100;

  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Notion query failed: ${res.status}`);
  }

  const data = await res.json();
  return data.results ?? [];
}

/**
 * Update a Notion page's properties.
 */
export async function updatePage(
  pageId: string,
  properties: Record<string, unknown>,
): Promise<void> {
  if (!notionClient) return;
  await notionClient.pages.update({ page_id: pageId, properties: properties as any });
}

/**
 * Search across Notion workspace.
 */
export async function searchNotion(query: string): Promise<any[]> {
  if (!notionClient) return [];
  const response = await notionClient.search({ query });
  return response.results;
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
export async function createPage(dbId: string, properties: Record<string, unknown>): Promise<string | null> {
  if (!notionClient) return null;
  const response = await (notionClient as any).pages.create({
    parent: { database_id: dbId },
    properties,
  });
  return response.id;
}

/**
 * Archive (soft-delete) a page.
 */
export async function archivePage(pageId: string): Promise<void> {
  if (!notionClient) return;
  await (notionClient as any).pages.update({
    page_id: pageId,
    archived: true,
  });
}

/**
 * Get page blocks (content).
 */
export async function getPageBlocks(pageId: string): Promise<any[]> {
  if (!notionClient) return [];
  const response = await (notionClient as any).blocks.children.list({
    block_id: pageId,
    page_size: 100,
  });
  return response.results;
}

/**
 * Append blocks to a page.
 */
export async function appendBlocks(pageId: string, children: any[]): Promise<void> {
  if (!notionClient) return;
  await (notionClient as any).blocks.children.append({
    block_id: pageId,
    children,
  });
}

/**
 * Get a single page.
 */
export async function getPage(pageId: string): Promise<any | null> {
  if (!notionClient) return null;
  return await (notionClient as any).pages.retrieve({ page_id: pageId });
}
