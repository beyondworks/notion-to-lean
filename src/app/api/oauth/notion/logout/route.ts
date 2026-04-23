import { NextResponse } from 'next/server';
import { clearSessionCookies } from '@/lib/notion-session';

function logoutResponse() {
  const response = NextResponse.json({ ok: true });
  clearSessionCookies(response);
  return response;
}

export async function POST() {
  return logoutResponse();
}

export async function GET() {
  return logoutResponse();
}
