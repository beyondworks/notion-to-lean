import { NextResponse } from 'next/server';
import { getRequestApiKey, isNotionEnabled, getPageBlocks, appendBlocks, queryDatabase, getPropertyValueMulti, pageUrl, updateBlock } from '@/lib/notion';

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

async function mapBlockRecursive(block: any, token: string | null): Promise<any> {
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
      const rows = await queryDatabase(block.id, undefined, undefined, token);
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
      const children = await getPageBlocks(block.id, token);
      base.children = await Promise.all(children.map(child => mapBlockRecursive(child, token)));
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
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const token = getRequestApiKey(request);

  if (!isNotionEnabled(token)) {
    return NextResponse.json({ data: [], mock: false });
  }

  try {
    const rawBlocks = await getPageBlocks(id, token);
    const data = await Promise.all(rawBlocks.map(block => mapBlockRecursive(block, token)));
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
  const token = getRequestApiKey(request);

  let body: {
    blocks?: any[];
    blockId?: string;
    checked?: boolean;
    content?: string;
    blockType?: string; // optional hint (paragraph | heading_1 | ... | bulleted_list_item | quote | to_do | callout | code)
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Branch 1: update a single block (checkbox or text content)
  if (body.blockId) {
    if (!isNotionEnabled(token)) {
      return NextResponse.json({ error: 'Notion connection required' }, { status: 401 });
    }
    try {
      // Checkbox toggle
      if (typeof body.checked === 'boolean') {
        await updateBlock(body.blockId, { to_do: { checked: body.checked } }, token);
        return NextResponse.json({ success: true, mock: false });
      }
      // Text content edit
      if (typeof body.content === 'string') {
        const type = body.blockType || 'paragraph';
        // Types that store text in a `rich_text` array
        const richTextTypes = new Set([
          'paragraph', 'heading_1', 'heading_2', 'heading_3',
          'bulleted_list_item', 'numbered_list_item', 'to_do',
          'toggle', 'quote', 'callout', 'code',
        ]);
        if (!richTextTypes.has(type)) {
          return NextResponse.json({ error: `Unsupported blockType for text edit: ${type}` }, { status: 400 });
        }
        const payload: Record<string, unknown> = {
          [type]: {
            rich_text: body.content.length
              ? [{ type: 'text', text: { content: body.content } }]
              : [],
          },
        };
        await updateBlock(body.blockId, payload, token);
        return NextResponse.json({ success: true, mock: false });
      }
      return NextResponse.json({ error: 'blockId requires either `checked` or `content`' }, { status: 400 });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error('[pages/[id]/blocks PATCH update]', message);
      return NextResponse.json({ error: 'Failed to update block', detail: message }, { status: 500 });
    }
  }

  // Branch 2: append new blocks
  if (!Array.isArray(body.blocks) || body.blocks.length === 0) {
    return NextResponse.json({ error: 'Either blockId (update) or blocks[] (append) is required' }, { status: 400 });
  }

  if (!isNotionEnabled(token)) {
    return NextResponse.json({ error: 'Notion connection required' }, { status: 401 });
  }

  try {
    await appendBlocks(id, body.blocks, token);
    return NextResponse.json({ success: true, mock: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[pages/[id]/blocks PATCH]', message);
    return NextResponse.json({ error: 'Failed to append blocks', detail: message }, { status: 500 });
  }
}
