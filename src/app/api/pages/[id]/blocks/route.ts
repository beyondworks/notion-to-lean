import { NextResponse } from 'next/server';
import { isNotionEnabled, getPageBlocks, appendBlocks, queryDatabase, getPropertyValueMulti, pageUrl } from '@/lib/notion';

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

// Table row cells are arrays of rich_text arrays (2D)
function extractTableRow(block: any): string[] {
  const cells = block.table_row?.cells;
  if (!Array.isArray(cells)) return [];
  return cells.map((cell: any) =>
    Array.isArray(cell) ? cell.map((t: any) => t.plain_text).join('') : '',
  );
}

async function mapBlockRecursive(block: any): Promise<any> {
  const base: any = {
    id: block.id,
    type: block.type,
    content: extractBlockContent(block),
  };

  if (block.type === 'to_do') base.checked = block.to_do?.checked ?? false;

  if (block.type === 'table') {
    base.hasColumnHeader = block.table?.has_column_header ?? false;
    base.hasRowHeader = block.table?.has_row_header ?? false;
  }

  if (block.type === 'table_row') {
    base.cells = extractTableRow(block);
  }

  if (block.type === 'image') {
    base.imageUrl = block.image?.external?.url ?? block.image?.file?.url ?? null;
    base.caption = Array.isArray(block.image?.caption)
      ? block.image.caption.map((t: any) => t.plain_text).join('')
      : '';
  }

  if (block.type === 'callout') {
    base.icon = block.callout?.icon?.emoji ?? null;
  }

  if (block.type === 'code') {
    base.language = block.code?.language ?? 'plain text';
  }

  if (block.type === 'bookmark') {
    base.url = block.bookmark?.url ?? '';
    base.caption = Array.isArray(block.bookmark?.caption)
      ? block.bookmark.caption.map((t: any) => t.plain_text).join('')
      : '';
  }

  if (block.type === 'embed') {
    base.url = block.embed?.url ?? '';
    base.caption = Array.isArray(block.embed?.caption)
      ? block.embed.caption.map((t: any) => t.plain_text).join('')
      : '';
  }

  if (block.type === 'link_preview') {
    base.url = block.link_preview?.url ?? '';
  }

  if (block.type === 'video') {
    base.videoUrl = block.video?.external?.url ?? block.video?.file?.url ?? null;
  }

  if (block.type === 'file') {
    base.fileUrl = block.file?.external?.url ?? block.file?.file?.url ?? null;
    base.fileName = block.file?.name ?? '';
  }

  if (block.type === 'child_database') {
    base.databaseTitle = block.child_database?.title ?? '';
    // block.id is the database id — query for entries (top 20)
    try {
      const rows = await queryDatabase(block.id);
      base.entries = rows.slice(0, 20).map((row: any) => {
        const title = getPropertyValueMulti(
          row,
          ['Entry name', 'Entry', 'Name', 'Title', '제목', '이름'],
          'title',
        );
        // Collect select-type and date properties generically
        const extraProps: Record<string, string> = {};
        for (const [propName, def] of Object.entries(row.properties ?? {})) {
          const d = def as any;
          if (d.type === 'select' && d.select?.name) extraProps[propName] = d.select.name;
          else if (d.type === 'status' && d.status?.name) extraProps[propName] = d.status.name;
          else if (d.type === 'date' && d.date?.start) extraProps[propName] = d.date.start;
          else if (d.type === 'url' && d.url) extraProps[propName] = d.url;
        }
        return {
          id: row.id,
          title: title || '(제목 없음)',
          props: extraProps,
          url: pageUrl(row.id),
        };
      });
    } catch {
      base.entries = [];
    }
  }

  // Recursively fetch children for blocks that may contain them
  // (toggle, bulleted_list_item, numbered_list_item, to_do, table, quote, column, column_list, synced_block, callout)
  if (block.has_children) {
    try {
      const children = await getPageBlocks(block.id);
      base.children = await Promise.all(children.map(mapBlockRecursive));
    } catch {
      base.children = [];
    }
  }

  return base;
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
    return NextResponse.json({ data: [], mock: true });
  }

  try {
    const rawBlocks = await getPageBlocks(id);
    const data = await Promise.all(rawBlocks.map(mapBlockRecursive));
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
