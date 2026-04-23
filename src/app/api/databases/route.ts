import { NextResponse } from 'next/server';
import { getRequestApiKey, isNotionEnabled, listDatabases } from '@/lib/notion';

/**
 * GET /api/databases — list all databases the integration has access to.
 * Returns shape: { data: [{ id, title, icon, cover, url, lastEditedAt }, ...], mock: bool }
 */
export async function GET(request: Request) {
  const token = getRequestApiKey(request);
  if (!isNotionEnabled(token)) {
    return NextResponse.json({ data: [], mock: false });
  }

  try {
    const rows = await listDatabases(token);
    const data = rows.map((db: any) => {
      const title = Array.isArray(db.title)
        ? db.title.map((t: any) => t.plain_text).join('')
        : '(이름 없음)';
      let icon: string | null = null;
      if (db.icon) {
        if (db.icon.type === 'emoji') icon = db.icon.emoji;
        else if (db.icon.type === 'external') icon = db.icon.external?.url ?? null;
        else if (db.icon.type === 'file') icon = db.icon.file?.url ?? null;
        else if (db.icon.type === 'custom_emoji') icon = db.icon.custom_emoji?.url ?? null;
      }
      const cover = db.cover?.external?.url ?? db.cover?.file?.url ?? null;
      const databaseId = db.database_parent?.database_id ?? db.parent?.database_id ?? db.id;
      const fallbackIcon = (title && title !== '(이름 없음)')
        ? title.trim().charAt(0).toUpperCase()
        : '?';
      return {
        id: db.id,
        databaseId,
        object: db.object ?? 'database',
        source: db.source ?? db.object ?? 'database',
        title: title || '(이름 없음)',
        icon: icon || fallbackIcon,
        cover,
        url: db.url ?? null,
        lastEditedAt: db.last_edited_time ?? null,
      };
    });
    return NextResponse.json({ data, mock: false });
  } catch (err) {
    console.warn('[databases] list failed', err instanceof Error ? err.message : err);
    return NextResponse.json({ data: [], mock: false, error: 'list failed' });
  }
}
