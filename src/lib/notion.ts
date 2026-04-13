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
  if (!notionClient) return [];

  const params: Record<string, unknown> = { data_source_id: dbId };
  if (filter) params.filter = filter;
  if (sorts) params.sorts = sorts;

  // @notionhq/client v5.17 types expose query on dataSources but TS inference
  // sometimes fails depending on the declaration map. Use `any` cast for safety.
  const queryFn = (notionClient as any).dataSources?.query ?? (notionClient as any).databases?.query;
  if (!queryFn) return [];
  const response = await queryFn(params);
  return response.results;
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
