export function notionOAuthClientId(): string | null {
  return process.env.NOTION_OAUTH_CLIENT_ID || process.env.OAUTH_CLIENT_ID || null;
}

export function notionOAuthClientSecret(): string | null {
  return process.env.NOTION_OAUTH_CLIENT_SECRET || process.env.OAUTH_CLIENT_SECRET || null;
}

export function notionOAuthConfigured(): boolean {
  return Boolean(notionOAuthClientId() && notionOAuthClientSecret());
}

export function notionOAuthRedirectUri(request: Request): string {
  return (
    process.env.NOTION_OAUTH_REDIRECT_URI ||
    process.env.OAUTH_REDIRECT_URI ||
    new URL('/api/oauth/notion/callback', request.url).toString()
  );
}

export function appUrl(request: Request, path = '/app'): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (configured) {
    const base = configured.startsWith('http') ? configured : `https://${configured}`;
    return new URL(path, base).toString();
  }
  return new URL(path, request.url).toString();
}
