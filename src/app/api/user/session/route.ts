import { NextResponse } from 'next/server';
import { notionOAuthConfigured } from '@/lib/notion-oauth';
import { getDbMappingFromRequest, getNotionSessionFromRequest } from '@/lib/notion-session';

export async function GET(request: Request) {
  const session = getNotionSessionFromRequest(request);
  const hasInternalKey = Boolean(process.env.NOTION_API_KEY);
  return NextResponse.json({
    connected: Boolean(session?.accessToken),
    internalKeyConfigured: hasInternalKey,
    oauthConfigured: notionOAuthConfigured(),
    profile: session
      ? {
          botId: session.botId ?? null,
          workspaceId: session.workspaceId ?? null,
          workspaceName: session.workspaceName ?? 'Connected Notion',
          workspaceIcon: session.workspaceIcon ?? null,
          createdAt: session.createdAt,
        }
      : null,
    mapping: getDbMappingFromRequest(request),
  });
}
