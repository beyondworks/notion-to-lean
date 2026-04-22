/**
 * Client-safe database ID constants.
 * These are non-secret Notion database identifiers; safe to ship to the browser.
 * Kept in a separate file so client components can import without pulling in
 * the Notion SDK (which is server-only).
 */
export const DB_IDS_CLIENT = {
  TASKS: '242003c7-f7be-804a-9d6e-f76d5d0347b4',
  TIMELINE: '28f003c7-f7be-8080-85b4-d73efe3cb896',
  SCHEDULED_FINANCE: '15007d59-2e5f-4b88-85a3-95fb4c77b90a',
  INSIGHTS: '241003c7-f7be-800b-b71c-df3acddc5bb8',
  WORKS: '241003c7-f7be-8011-8ba4-cecf131df2a0',
} as const;
