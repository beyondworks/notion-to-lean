import { NextResponse } from 'next/server';
import { appUrl, notionOAuthClientId, notionOAuthClientSecret, notionOAuthRedirectUri } from '@/lib/notion-oauth';
import {
  NOTION_OAUTH_STATE_COOKIE,
  readCookie,
  setSessionCookie,
  type NotionSession,
} from '@/lib/notion-session';

export async function GET(request: Request) {
  const callbackUrl = new URL(request.url);
  const error = callbackUrl.searchParams.get('error');
  if (error) {
    return NextResponse.redirect(new URL(`/app?oauth_error=${encodeURIComponent(error)}`, appUrl(request)));
  }

  const code = callbackUrl.searchParams.get('code');
  const state = callbackUrl.searchParams.get('state');
  const expectedState = readCookie(request, NOTION_OAUTH_STATE_COOKIE);
  if (!code || !state || !expectedState || state !== expectedState) {
    return NextResponse.redirect(new URL('/app?oauth_error=invalid_state', appUrl(request)));
  }

  const clientId = notionOAuthClientId();
  const clientSecret = notionOAuthClientSecret();
  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/app?oauth_error=notion_oauth_not_configured', appUrl(request)));
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const tokenRes = await fetch('https://api.notion.com/v1/oauth/token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      grant_type: 'authorization_code',
      code,
      redirect_uri: notionOAuthRedirectUri(request),
    }),
  });

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL('/app?oauth_error=token_exchange_failed', appUrl(request)));
  }

  const token = await tokenRes.json();
  const session: NotionSession = {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    botId: token.bot_id,
    workspaceId: token.workspace_id,
    workspaceName: token.workspace_name,
    workspaceIcon: token.workspace_icon ?? null,
    owner: token.owner,
    duplicatedTemplateId: token.duplicated_template_id ?? null,
    createdAt: Date.now(),
  };

  const response = NextResponse.redirect(new URL('/app?notion=connected', appUrl(request)));
  setSessionCookie(response, session);
  response.cookies.set(NOTION_OAUTH_STATE_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
  return response;
}
