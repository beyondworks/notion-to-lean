# Nolio

Mobile-first Notion client built as a Next.js PWA.

## Getting Started

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000/app](http://localhost:3000/app).

## Notion OAuth

The app supports Notion OAuth for general users and keeps the access token in an encrypted `HttpOnly` cookie. Browser JavaScript does not read the OAuth access token.

1. Create a Notion public integration in the Notion developer dashboard.
2. Add this redirect URI to the integration:

```text
https://notion-to-lean.vercel.app/api/oauth/notion/callback
```

3. Add these Vercel Production environment variables:

```text
NOTION_OAUTH_CLIENT_ID
NOTION_OAUTH_CLIENT_SECRET
NOTION_OAUTH_REDIRECT_URI=https://notion-to-lean.vercel.app/api/oauth/notion/callback
NOTION_SESSION_SECRET
NEXT_PUBLIC_APP_URL=https://notion-to-lean.vercel.app
```

`NOTION_SESSION_SECRET` should be a long random value. Do not commit real secrets.

4. Redeploy production.

```bash
pnpm dlx vercel@51.8.0 deploy --prod --yes
```

5. Visit `/app`, choose `Notion으로 계속`, authorize the workspace, then map databases in `DB 선택`.

## User DB Mapping

After OAuth login, each user can assign their own databases to the app roles:

- `태스크`
- `웍스`
- `인사이트`
- `가계부`
- `스크립트`

The mapping is stored in an encrypted `HttpOnly` cookie and is used by `/api/tasks`, `/api/works`, `/api/insights`, `/api/finance`, `/api/reflection`, and `/api/metrics/weekly`.

## Deploy on Vercel

Production URL:

[https://notion-to-lean.vercel.app/app](https://notion-to-lean.vercel.app/app)
