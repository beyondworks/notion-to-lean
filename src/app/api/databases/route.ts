import { NextResponse } from 'next/server';
import { getRequestApiKey, isNotionEnabled, listDatabases } from '@/lib/notion';

type NotionText = { plain_text?: string };
type NotionOption = { id?: string; name?: string; color?: string | null };
type NotionDatabaseLike = Record<string, unknown> & {
  id?: string;
  title?: NotionText[];
  icon?: Record<string, unknown>;
  cover?: { external?: { url?: string }; file?: { url?: string } };
  database_parent?: { database_id?: string };
  parent?: { database_id?: string };
  object?: string;
  source?: string;
  url?: string | null;
  last_edited_time?: string | null;
  properties?: Record<string, unknown>;
};
type DatabaseListItem = {
  id: string | undefined;
  databaseId: string | undefined;
  dataSourceId: string | undefined;
  canonicalId: string;
  object: string;
  source: string;
  title: string;
  icon: string;
  cover: string | null;
  url: string | null;
  lastEditedAt: string | null;
  properties: Array<{ name: string; type: string; options: Array<{ id?: string; name?: string; color?: string | null }> }>;
};

/**
 * GET /api/databases — list all databases the integration has access to.
 * Returns shape: { data: [{ id, title, icon, cover, url, lastEditedAt }, ...], mock: bool }
 */
function normalizeId(id: unknown): string {
  return typeof id === 'string' ? id.replace(/-/g, '').toLowerCase() : '';
}

function sourceRank(source: unknown): number {
  if (source === 'data_source') return 3;
  if (source === 'database') return 2;
  if (source === 'child_database') return 1;
  return 0;
}

function schemaKey(db: DatabaseListItem): string {
  const props = (db.properties ?? [])
    .map((prop) => `${prop.name}:${prop.type}`)
    .sort()
    .join('|');
  return `${db.title.trim().toLowerCase()}::${props}`;
}

function chooseDatabaseListItem(current: DatabaseListItem, next: DatabaseListItem): DatabaseListItem {
  if (sourceRank(next.source) !== sourceRank(current.source)) {
    return sourceRank(next.source) > sourceRank(current.source) ? next : current;
  }
  return Date.parse(next.lastEditedAt ?? '') > Date.parse(current.lastEditedAt ?? '') ? next : current;
}

function schemaSummary(properties: unknown) {
  if (!properties || typeof properties !== 'object') return [];
  return Object.entries(properties as Record<string, Record<string, unknown>>).map(([name, def]) => {
    const type = typeof def?.type === 'string' ? def.type : 'unknown';
    const config = (def?.[type] && typeof def[type] === 'object' ? def[type] : {}) as { options?: NotionOption[] };
    const options = Array.isArray(config.options)
      ? config.options.map((opt) => ({ id: opt.id, name: opt.name, color: opt.color ?? null }))
      : [];
    return { name, type, options };
  });
}

export async function GET(request: Request) {
  const token = getRequestApiKey(request);
  if (!isNotionEnabled(token)) {
    return NextResponse.json({ data: [], mock: false });
  }

  try {
    const rows = await listDatabases(token);
    const mapped: DatabaseListItem[] = rows.map((db: NotionDatabaseLike) => {
      const title = Array.isArray(db.title)
        ? db.title.map((t) => t.plain_text).join('')
        : '(이름 없음)';
      let icon: string | null = null;
      if (db.icon) {
        if (db.icon.type === 'emoji') icon = typeof db.icon.emoji === 'string' ? db.icon.emoji : null;
        else if (db.icon.type === 'external') icon = ((db.icon.external as { url?: string } | undefined)?.url) ?? null;
        else if (db.icon.type === 'file') icon = ((db.icon.file as { url?: string } | undefined)?.url) ?? null;
        else if (db.icon.type === 'custom_emoji') icon = ((db.icon.custom_emoji as { url?: string } | undefined)?.url) ?? null;
      }
      const cover = db.cover?.external?.url ?? db.cover?.file?.url ?? null;
      const rawId = db.id;
      const databaseId = db.database_parent?.database_id ?? db.parent?.database_id ?? db.id;
      const dataSourceId = db.object === 'data_source' || db.source === 'data_source' ? rawId : undefined;
      const canonicalId = normalizeId(databaseId) || normalizeId(db.id);
      const fallbackIcon = (title && title !== '(이름 없음)')
        ? title.trim().charAt(0).toUpperCase()
        : '?';
      return {
        id: databaseId ?? rawId,
        databaseId,
        dataSourceId,
        canonicalId,
        object: db.object ?? 'database',
        source: db.source ?? db.object ?? 'database',
        title: title || '(이름 없음)',
        icon: icon || fallbackIcon,
        cover,
        url: db.url ?? null,
        lastEditedAt: db.last_edited_time ?? null,
        properties: schemaSummary(db.properties),
      };
    });
    const byKey = new Map<string, DatabaseListItem>();
    for (const db of mapped) {
      if (!db.id || !db.title || db.title === '(이름 없음)') continue;
      const titleKey = db.title.trim().toLowerCase();
      const key = db.canonicalId || titleKey;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, db);
        continue;
      }
      byKey.set(key, chooseDatabaseListItem(existing, db));
    }
    const bySchema = new Map<string, DatabaseListItem>();
    for (const db of byKey.values()) {
      const key = schemaKey(db);
      const existing = bySchema.get(key);
      bySchema.set(key, existing ? chooseDatabaseListItem(existing, db) : db);
    }
    const data = Array.from(bySchema.values())
      .sort((a, b) => String(a.title).localeCompare(String(b.title)));
    return NextResponse.json({ data, mock: false });
  } catch (err) {
    console.warn('[databases] list failed', err instanceof Error ? err.message : err);
    return NextResponse.json({ data: [], mock: false, error: 'list failed' });
  }
}
