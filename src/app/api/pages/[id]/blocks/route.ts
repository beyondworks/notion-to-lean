import { NextResponse } from 'next/server';
import type { PageBlock } from '@/lib/types';
import { isNotionEnabled, getPageBlocks, appendBlocks } from '@/lib/notion';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function extractBlockContent(block: any): string {
  const type = block.type;
  const data = block[type];
  if (!data) return '';

  // Most block types store text in rich_text array
  if (Array.isArray(data.rich_text)) {
    return data.rich_text.map((t: any) => t.plain_text).join('');
  }

  return '';
}

function mapBlock(block: any): PageBlock {
  return {
    id: block.id,
    type: block.type,
    content: extractBlockContent(block),
    ...(block.type === 'to_do' ? { checked: block.to_do?.checked ?? false } : {}),
  };
}

// ---------------------------------------------------------------------------
// GET /api/pages/[id]/blocks — Retrieve page blocks
// ---------------------------------------------------------------------------
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!isNotionEnabled()) {
    return NextResponse.json({ data: [] as PageBlock[], mock: true });
  }

  try {
    const rawBlocks = await getPageBlocks(id);
    const data: PageBlock[] = rawBlocks.map(mapBlock);
    return NextResponse.json({ data, mock: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[pages/[id]/blocks GET]', message);
    return NextResponse.json({ error: 'Failed to retrieve blocks', detail: message }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// PATCH /api/pages/[id]/blocks — Append blocks to a page
// ---------------------------------------------------------------------------
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: { blocks?: any[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!Array.isArray(body.blocks) || body.blocks.length === 0) {
    return NextResponse.json({ error: 'blocks array is required and must not be empty' }, { status: 400 });
  }

  if (!isNotionEnabled()) {
    return NextResponse.json({ success: true, mock: true });
  }

  try {
    await appendBlocks(id, body.blocks);
    return NextResponse.json({ success: true, mock: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[pages/[id]/blocks PATCH]', message);
    return NextResponse.json({ error: 'Failed to append blocks', detail: message }, { status: 500 });
  }
}
