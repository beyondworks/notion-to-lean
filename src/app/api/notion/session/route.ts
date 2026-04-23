import { NextResponse } from 'next/server';

const NOTION_VERSION = '2022-06-28';

function titleText(title: any): string {
  if (!Array.isArray(title)) return '(이름 없음)';
  return title.map((t: any) => t.plain_text || '').join('').trim() || '(이름 없음)';
}

export async function POST(request: Request) {
  let body: { token?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const token = body.token?.trim();
  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 });
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Notion-Version': NOTION_VERSION,
    'Content-Type': 'application/json',
  };

  try {
    const meRes = await fetch('https://api.notion.com/v1/users/me', { headers });
    if (!meRes.ok) {
      return NextResponse.json({ error: 'Notion token could not be verified' }, { status: 401 });
    }
    const me = await meRes.json();

    const dbRes = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        filter: { property: 'object', value: 'database' },
        page_size: 20,
      }),
    });
    const dbJson = dbRes.ok ? await dbRes.json() : { results: [] };
    const databases = (dbJson.results ?? []).map((db: any) => ({
      id: db.id,
      title: titleText(db.title),
      url: db.url ?? null,
    }));

    return NextResponse.json({
      ok: true,
      profile: {
        id: me.id,
        name: me.name || me.bot?.owner?.workspace_name || 'Connected Notion',
        avatarUrl: me.avatar_url ?? null,
        databaseCount: dbJson.results?.length ?? 0,
      },
      databases,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: 'Failed to connect Notion', detail: message }, { status: 500 });
  }
}
