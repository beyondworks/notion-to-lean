import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { appUrl, notionOAuthClientId, notionOAuthRedirectUri } from '@/lib/notion-oauth';
import { setOAuthStateCookie } from '@/lib/notion-session';

export async function GET(request: Request) {
  const clientId = notionOAuthClientId();
  if (!clientId) {
    return NextResponse.redirect(new URL('/app?oauth_error=notion_oauth_not_configured', appUrl(request)));
  }

  const state = crypto.randomBytes(24).toString('base64url');
  const redirectUri = notionOAuthRedirectUri(request);
  const url = new URL('https://api.notion.com/v1/oauth/authorize');
  url.searchParams.set('owner', 'user');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('state', state);

  const response = NextResponse.redirect(url);
  setOAuthStateCookie(response, state);
  return response;
}
