import crypto from 'node:crypto';
import type { NextResponse } from 'next/server';

export const NOTION_SESSION_COOKIE = 'nm_notion_session';
export const NOTION_MAPPING_COOKIE = 'nm_db_mapping';
export const NOTION_OAUTH_STATE_COOKIE = 'nm_oauth_state';

export type NotionSession = {
  accessToken: string;
  refreshToken?: string;
  botId?: string;
  workspaceId?: string;
  workspaceName?: string;
  workspaceIcon?: string | null;
  owner?: unknown;
  duplicatedTemplateId?: string | null;
  createdAt: number;
};

export type DbMapping = Partial<Record<'tasks' | 'calendar' | 'works' | 'insights' | 'finance' | 'reflection', string>>;

const mappingKeys = new Set(['tasks', 'calendar', 'works', 'insights', 'finance', 'reflection']);
const notionIdPattern = /^[a-f0-9-]{32,36}$/i;
const devSessionSecret = crypto.randomBytes(32).toString('hex');

function sessionSecret(): string {
  const configured = process.env.NOTION_SESSION_SECRET || process.env.AUTH_SECRET;
  if (configured) return configured;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('NOTION_SESSION_SECRET is required in production');
  }
  return process.env.NOTION_OAUTH_CLIENT_SECRET || process.env.NOTION_API_KEY || devSessionSecret;
}

function key(): Buffer {
  return crypto.createHash('sha256').update(sessionSecret()).digest();
}

function b64url(input: Buffer): string {
  return input.toString('base64url');
}

function fromB64url(input: string): Buffer {
  return Buffer.from(input, 'base64url');
}

export function sealJson(value: unknown): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key(), iv);
  const plaintext = Buffer.from(JSON.stringify(value), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [b64url(iv), b64url(tag), b64url(encrypted)].join('.');
}

export function unsealJson<T>(sealed?: string | null): T | null {
  if (!sealed) return null;
  const parts = sealed.split('.');
  if (parts.length !== 3) return null;
  try {
    const [ivRaw, tagRaw, encryptedRaw] = parts;
    const decipher = crypto.createDecipheriv('aes-256-gcm', key(), fromB64url(ivRaw));
    decipher.setAuthTag(fromB64url(tagRaw));
    const decrypted = Buffer.concat([decipher.update(fromB64url(encryptedRaw)), decipher.final()]);
    return JSON.parse(decrypted.toString('utf8')) as T;
  } catch {
    return null;
  }
}

export function readCookie(request: Request, name: string): string | null {
  const raw = request.headers.get('cookie') || '';
  const hit = raw.split(';').map(part => part.trim()).find(part => part.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
}

export function getNotionSessionFromRequest(request?: Request | null): NotionSession | null {
  if (!request) return null;
  return unsealJson<NotionSession>(readCookie(request, NOTION_SESSION_COOKIE));
}

export function getDbMappingFromRequest(request?: Request | null): DbMapping {
  if (!request) return {};
  return sanitizeDbMapping(unsealJson<DbMapping>(readCookie(request, NOTION_MAPPING_COOKIE)) || {});
}

export function sanitizeDbMapping(input: unknown): DbMapping {
  const raw = (input && typeof input === 'object') ? input as Record<string, unknown> : {};
  const next: DbMapping = {};
  for (const [key, value] of Object.entries(raw)) {
    if (!mappingKeys.has(key)) continue;
    if (typeof value !== 'string') continue;
    const normalized = value.trim();
    if (!notionIdPattern.test(normalized)) continue;
    next[key as keyof DbMapping] = normalized;
  }

  const grouped = new Map<string, Array<keyof DbMapping>>();
  for (const [key, value] of Object.entries(next) as Array<[keyof DbMapping, string]>) {
    const list = grouped.get(value) ?? [];
    list.push(key);
    grouped.set(value, list);
  }
  for (const keys of grouped.values()) {
    const allowedPair = keys.every((key) => key === 'tasks' || key === 'calendar');
    if (keys.length > 1 && !allowedPair) {
      keys.forEach((key) => delete next[key]);
    }
  }

  return next;
}

const secure = process.env.NODE_ENV === 'production';

export function setSessionCookie(response: NextResponse, session: NotionSession): void {
  response.cookies.set(NOTION_SESSION_COOKIE, sealJson(session), {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.set(NOTION_SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: 0 });
  response.cookies.set(NOTION_MAPPING_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: 0 });
  response.cookies.set(NOTION_OAUTH_STATE_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure, path: '/', maxAge: 0 });
}

export function setMappingCookie(response: NextResponse, mapping: DbMapping): void {
  response.cookies.set(NOTION_MAPPING_COOKIE, sealJson(sanitizeDbMapping(mapping)), {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
  });
}

export function setOAuthStateCookie(response: NextResponse, state: string): void {
  response.cookies.set(NOTION_OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: 60 * 10,
  });
}
