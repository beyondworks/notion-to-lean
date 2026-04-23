/**
 * Notion database ID constants — single source of truth.
 * Non-secret identifiers; safe to ship to the browser.
 * Server code (notion.ts) re-exports this; client components import directly.
 */
export const DB_IDS = {
  TASKS: '242003c7-f7be-804a-9d6e-f76d5d0347b4',
  TIMELINE: '28f003c7-f7be-8080-85b4-d73efe3cb896',
  SCHEDULED_FINANCE: '15007d59-2e5f-4b88-85a3-95fb4c77b90a',
  INSIGHTS: '241003c7-f7be-800b-b71c-df3acddc5bb8',
  WORKS: '241003c7-f7be-8011-8ba4-cecf131df2a0',
  PARENT_TASK: '242003c7-f7be-806b-a177-e8372eaa64a4',
  INSIGHTS_AI: '241003c7-f7be-800f-8f07-f95918c3a072',
  INSIGHTS_CLAUDE_CODE: '2fd003c7-f7be-80cb-90d3-dbecc15c507f',
  INSIGHTS_SCRAP: '247003c7-f7be-80c0-a9f4-cddbcd337415',
  INSIGHTS_DESIGN: '241003c7-f7be-804f-a021-fc24777ca9ad',
  INSIGHTS_BRANDING: '247003c7-f7be-803a-83f5-fd9494d24d62',
  INSIGHTS_BUILD: '247003c7-f7be-8074-a583-e1638fd3cfed',
  INSIGHTS_MARKETING: '247003c7-f7be-8035-83f4-d39480d66503',
  REFLECTION: '31e003c7-f7be-80a0-ab4f-c1e2249f3c24',
} as const;
