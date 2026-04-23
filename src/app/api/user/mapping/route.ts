import { NextResponse } from 'next/server';
import {
  getDbMappingFromRequest,
  getNotionSessionFromRequest,
  sanitizeDbMapping,
  setMappingCookie,
  type DbMapping,
} from '@/lib/notion-session';

function cleanMapping(input: unknown): DbMapping {
  return sanitizeDbMapping(input);
}

export async function GET(request: Request) {
  return NextResponse.json({ mapping: getDbMappingFromRequest(request) });
}

export async function PUT(request: Request) {
  if (!getNotionSessionFromRequest(request)) {
    return NextResponse.json({ error: 'OAuth session required' }, { status: 401 });
  }

  let body: { mapping?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const mapping = cleanMapping(body.mapping);
  const response = NextResponse.json({ ok: true, mapping });
  setMappingCookie(response, mapping);
  return response;
}
