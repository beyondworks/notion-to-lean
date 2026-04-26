/* Shared UI primitives for Notion × iOS26 prototype */

/* ── Minimal i18n ─────────────────── */
const I18N = {
  "한국어": {
    "홈": "홈", "검색": "검색", "새로": "새로", "인박스": "인박스", "나": "나",
    "안녕하세요": "안녕하세요",
    "데이터베이스": "데이터베이스", "오늘": "오늘", "최근": "최근",
    "무엇이든 검색, 명령 실행": "무엇이든 검색, 명령 실행",
    "설정": "설정", "프로필": "프로필", "인박스": "인박스", "캘린더": "캘린더",
    "새로고침": "새로고침", "다크 모드": "다크 모드",
  },
  "English": {
    "홈": "Home", "검색": "Search", "새로": "New", "인박스": "Inbox", "나": "Me",
    "안녕하세요": "Hi",
    "데이터베이스": "Databases", "오늘": "Today", "최근": "Recent",
    "무엇이든 검색, 명령 실행": "Search anything, run commands",
    "설정": "Settings", "프로필": "Profile", "캘린더": "Calendar",
    "새로고침": "Refresh", "다크 모드": "Dark Mode",
  },
};
function t(k) {
  if (typeof window === "undefined") return k;
  const lang = localStorage.getItem("nm-lang") || "한국어";
  return (I18N[lang] && I18N[lang][k]) || k;
}
window.t = t;

const { useState, useEffect, useRef, useMemo } = React;

/* ── Notion connection state ─────────────────────────── */
window.NM_OWNER_DB_IDS = window.NM_OWNER_DB_IDS || {
  tasks: "242003c7-f7be-804a-9d6e-f76d5d0347b4",
  calendar: "242003c7-f7be-804a-9d6e-f76d5d0347b4",
  works: "241003c7-f7be-8011-8ba4-cecf131df2a0",
  insights: "241003c7-f7be-800b-b71c-df3acddc5bb8",
  finance: "28f003c7-f7be-8080-85b4-d73efe3cb896",
  reflection: "31e003c7-f7be-80a0-ab4f-c1e2249f3c24",
};

window.NM_CORE_DB_KEYS = window.NM_CORE_DB_KEYS || ["tasks", "calendar", "works", "insights", "finance", "reflection"];
window.NM_EMPTY_DB_MESSAGE = "노션에서 데이터베이스를 추가해주세요";

window.nmSanitizeCoreDbMap = function nmSanitizeCoreDbMap(mapping) {
  const allowed = new Set(window.NM_CORE_DB_KEYS || []);
  const clean = {};
  Object.entries(mapping || {}).forEach(([key, value]) => {
    const id = typeof value === "string" ? value.trim() : "";
    if (allowed.has(key) && id) clean[key] = id;
  });

  const byId = {};
  Object.entries(clean).forEach(([key, id]) => {
    byId[id] = byId[id] || [];
    byId[id].push(key);
  });

  const droppedKeys = new Set();
  Object.entries(byId).forEach(([_, keys]) => {
    const allowedPair = keys.every(k => k === "tasks" || k === "calendar");
    if (keys.length > 1 && !allowedPair) keys.forEach(k => droppedKeys.add(k));
  });

  droppedKeys.forEach(key => delete clean[key]);
  return { map: clean, unsafe: droppedKeys.size > 0, droppedKeys: [...droppedKeys] };
};

window.nmStableDbMapJson = function nmStableDbMapJson(map) {
  const ordered = {};
  Object.keys(map || {}).sort().forEach(key => {
    ordered[key] = map[key];
  });
  return JSON.stringify(ordered);
};

window.nmInferDbRoles = function nmInferDbRoles(db) {
  const title = String(db?.title || "").toLowerCase();
  const props = Array.isArray(db?.properties) ? db.properties : [];
  const propNames = props.map(p => String(p?.name || "").toLowerCase()).join(" ");
  const propTypes = new Set(props.map(p => p?.type).filter(Boolean));
  const hay = `${title} ${propNames}`;
  const roles = [];

  const hasDate = propTypes.has("date");
  const hasMoney = propTypes.has("number") && /(amount|price|cost|money|금액|가격|비용|수입|지출|결제|영수증)/.test(hay);
  const hasTaskish = /(task|todo|to-do|할 일|태스크|완료|done|status|상태|priority|우선순위)/.test(hay);

  if (/(finance|money|expense|income|receipt|budget|가계|가계부|금전|수입|지출|영수증)/.test(hay) || hasMoney) roles.push("finance");
  if (/(calendar|event|schedule|timeline|일정|캘린더|타임라인|예약)/.test(hay)) roles.push("calendar");
  if (/(task|todo|to-do|kanban|backlog|태스크|할 일|업무)/.test(hay) || (hasTaskish && hasDate)) roles.push("tasks");
  if (/(work|project|client|crm|pipeline|워크|프로젝트|고객|거래|영업)/.test(hay)) roles.push("works");
  if (/(insight|article|knowledge|wiki|news|tips|research|인사이트|지식|뉴스|팁|리서치|아카이브)/.test(hay)) roles.push("insights");
  if (/(reflection|journal|diary|script|memo|note|회고|일기|스크립트|메모|노트)/.test(hay)) roles.push("reflection");

  if (!roles.includes("calendar") && roles.includes("tasks") && hasDate) roles.push("calendar");
  return [...new Set(roles)];
};

window.nmLoadCoreDbMap = function nmLoadCoreDbMap() {
  let raw = {};
  try { raw = JSON.parse(localStorage.getItem("nm-core-db-map") || "{}") || {}; } catch {}
  const result = window.nmSanitizeCoreDbMap(raw);
  if (result.unsafe) {
    try {
      if (Object.keys(result.map).length) localStorage.setItem("nm-core-db-map", JSON.stringify(result.map));
      else localStorage.removeItem("nm-core-db-map");
    } catch {}
  }
  return result.map;
};

window.nmConnectionMode = function nmConnectionMode() {
  return localStorage.getItem("nm-connection-mode") || "demo";
};

window.nmGetNotionToken = function nmGetNotionToken() {
  return localStorage.getItem("nm-notion-token") || "";
};

window.nmApiHeaders = function nmApiHeaders(extra = {}) {
  const headers = {...extra};
  const mode = window.nmConnectionMode();
  if (mode === "demo") headers["x-nm-demo-mode"] = "1";
  const token = mode === "custom" ? window.nmGetNotionToken() : "";
  if (token) headers["x-nm-notion-token"] = token;
  return headers;
};

window.nmCoreDbId = function nmCoreDbId(key) {
  const map = window.nmLoadCoreDbMap ? window.nmLoadCoreDbMap() : {};
  if (map[key]) return map[key];
  if (key === "calendar" && map.tasks) return map.tasks;
  return window.nmConnectionMode() === "owner" ? (window.NM_OWNER_DB_IDS[key] || null) : null;
};

window.nmCoreEndpoint = function nmCoreEndpoint(key) {
  const pathByKey = {
    tasks: "/api/tasks",
    calendar: "/api/tasks",
    works: "/api/works",
    insights: "/api/insights",
    finance: "/api/finance",
    reflection: "/api/reflection",
  };
  const path = pathByKey[key] || key;
  const dbId = window.nmCoreDbId(key);
  if (!dbId) return path;
  const url = new URL(path, window.location.origin);
  url.searchParams.set("dbId", dbId);
  return `${url.pathname}${url.search}`;
};

window.nmSetConnection = function nmSetConnection(mode, token = "") {
  const previousMode = localStorage.getItem("nm-connection-mode");
  const previousToken = localStorage.getItem("nm-notion-token") || "";
  const tokenChanged = mode === "custom" && token && previousMode === "custom" && previousToken && previousToken !== token;
  if ((previousMode && previousMode !== mode) || tokenChanged) {
    localStorage.removeItem("nm-workspace-key");
    window.nmClearWorkspaceLocalState?.();
  }
  localStorage.setItem("nm-connection-mode", mode);
  localStorage.setItem("nm-onboarded", "1");
  if (mode === "custom" && token) localStorage.setItem("nm-notion-token", token);
  if (mode !== "custom") localStorage.removeItem("nm-notion-token");
  window.nmInvalidate && window.nmInvalidate();
  window.dispatchEvent(new CustomEvent("nm-connection-update", { detail: { mode } }));
};

window.nmClearWorkspaceLocalState = function nmClearWorkspaceLocalState() {
  const keepKeys = new Set([
    "nm-onboarded",
    "nm-connection-mode",
    "nm-oauth-configured",
    "nm-notion-token",
    "nm-notion-profile",
    "nm-profile-name",
    "nm-profile-workspace",
    "nm-profile-plan",
    "nm-profile-avatar",
    "nm-dark",
    "nm-font-size",
    "nm-lang",
  ]);
  Object.keys(localStorage).forEach(key => {
    if (keepKeys.has(key)) return;
    if (
      key === "nm-pinned-dbs" ||
      key === "nm-home-widgets" ||
      key === "nm-bento-widgets" ||
      key === "nm-sections" ||
      key === "nm-core-db-map" ||
      key === "nm-db-list-cache" ||
      key === "nm-recent-pages" ||
      key.startsWith("nm-section-") ||
      key.startsWith("nm-db-alias-") ||
      key.startsWith("nm-db-filter-") ||
      key.startsWith("nm-dbfilter-") ||
      key.startsWith("nm-dbview-") ||
      key.startsWith("nm-notion-view-")
    ) {
      localStorage.removeItem(key);
    }
  });
  window.__nmDbListCache = null;
  window.__nmCache?.clear?.();
  window.__nmInflight?.clear?.();
};

window.nmRefreshSession = async function nmRefreshSession() {
  try {
    const res = await fetch("/api/user/session", { headers: window.nmApiHeaders() });
    if (!res.ok) return null;
    const json = await res.json();
    localStorage.setItem("nm-oauth-configured", json.oauthConfigured ? "1" : "0");
    localStorage.setItem("nm-oauth-connected", json.connected ? "1" : "0");
    // Auto-detect owner mode: server has NOTION_API_KEY but no OAuth session.
    // Preserve only an explicitly selected owner session; never switch OAuth users
    // back to the owner's workspace just because the public server has an API key.
    if (!json.connected && json.internalKeyConfigured) {
      const currentMode = localStorage.getItem("nm-connection-mode");
      if (currentMode === "owner") {
        localStorage.setItem("nm-connection-mode", "owner");
        localStorage.setItem("nm-onboarded", "1");
        window.nmInvalidate && window.nmInvalidate();
        window.dispatchEvent(new CustomEvent("nm-connection-update", { detail: { mode: "owner" } }));
      }
      return json;
    }
    if (json.connected) {
      const previousMode = localStorage.getItem("nm-connection-mode");
      const previousWorkspace = localStorage.getItem("nm-workspace-key");
      const nextWorkspace = json.profile?.workspaceId || json.profile?.workspaceName || "oauth";
      const mappingResult = json.mapping && Object.keys(json.mapping).length
        ? window.nmSanitizeCoreDbMap(json.mapping)
        : { map: {} };
      const mappingCount = Object.keys(mappingResult.map).length;
      const previousMapRaw = window.nmStableDbMapJson(window.nmLoadCoreDbMap?.() || {});
      const nextMapRaw = window.nmStableDbMapJson(mappingResult.map);
      const hasWorkspaceLocalState = Boolean(
        localStorage.getItem("nm-pinned-dbs") ||
        localStorage.getItem("nm-home-widgets") ||
        localStorage.getItem("nm-sections") ||
        localStorage.getItem("nm-core-db-map") ||
        localStorage.getItem("nm-db-list-cache") ||
        Object.keys(localStorage).some(key => key.startsWith("nm-section-"))
      );
      const shouldClearOldHome =
        (previousWorkspace && previousWorkspace !== nextWorkspace) ||
        (!previousWorkspace && hasWorkspaceLocalState) ||
        (previousWorkspace === nextWorkspace && previousMapRaw !== nextMapRaw && hasWorkspaceLocalState);
      if (shouldClearOldHome) window.nmClearWorkspaceLocalState?.();
      localStorage.setItem("nm-workspace-key", nextWorkspace);
      localStorage.setItem("nm-connection-mode", "oauth");
      localStorage.setItem("nm-onboarded", "1");
      if (json.profile?.workspaceName) {
        localStorage.setItem("nm-profile-name", json.profile.workspaceName);
        localStorage.setItem("nm-profile-workspace", json.profile.workspaceName);
      }
      if (mappingCount) {
        if (Object.keys(mappingResult.map).length) localStorage.setItem("nm-core-db-map", JSON.stringify(mappingResult.map));
        else localStorage.removeItem("nm-core-db-map");
      } else {
        localStorage.removeItem("nm-core-db-map");
      }
      window.nmInvalidate && window.nmInvalidate();
    }
    return json;
  } catch {
    return null;
  }
};

window.nmSaveDbMapping = async function nmSaveDbMapping(mapping) {
  const result = window.nmSanitizeCoreDbMap(mapping || {});
  const previousMapRaw = window.nmStableDbMapJson(window.nmLoadCoreDbMap?.() || {});
  const nextMapRaw = window.nmStableDbMapJson(result.map);
  if (previousMapRaw !== nextMapRaw) {
    window.nmInvalidate && window.nmInvalidate();
  }
  localStorage.setItem("nm-core-db-map", JSON.stringify(result.map));
  if (window.nmConnectionMode() !== "oauth") return { ok: true, mapping };
  if (localStorage.getItem("nm-oauth-connected") !== "1") {
    return { ok: true, mapping: result.map, localOnly: true };
  }
  const res = await fetch("/api/user/mapping", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mapping: result.map }),
  });
  return res.ok ? res.json() : { ok: false };
};

window.nmLogoutNotion = async function nmLogoutNotion() {
  try { await fetch("/api/oauth/notion/logout", { method: "POST" }); } catch {}
  localStorage.removeItem("nm-notion-token");
  localStorage.removeItem("nm-notion-profile");
  localStorage.removeItem("nm-profile-workspace");
  localStorage.removeItem("nm-oauth-connected");
  localStorage.removeItem("nm-core-db-map");
  localStorage.removeItem("nm-workspace-key");
  window.nmClearWorkspaceLocalState?.();
  localStorage.setItem("nm-connection-mode", "demo");
  window.nmInvalidate && window.nmInvalidate();
};

if (!window.__nmNativeFetch) {
  window.__nmNativeFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url;
    const u = url ? new URL(url, window.location.href) : null;
    const isLocalApi = u && u.origin === window.location.origin && u.pathname.startsWith("/api/");
    if (!isLocalApi) return window.__nmNativeFetch(input, init);

    const headers = new Headers(init.headers || {});
    const authHeaders = window.nmApiHeaders();
    Object.entries(authHeaders).forEach(([k, v]) => {
      if (v && !headers.has(k)) headers.set(k, v);
    });
    return window.__nmNativeFetch(input, { ...init, headers });
  };
}

/* ──────────────────────────────────────────────────────────
 *  SWR-like fetch cache
 *  - returns cached data synchronously on re-navigation
 *  - revalidates stale entries in the background
 *  - dedupes in-flight requests
 *  - broadcasts "nm-cache-update" events so subscribers can refresh
 * ────────────────────────────────────────────────────────── */
window.__nmCache = window.__nmCache || new Map();      // url → { data, at }
window.__nmInflight = window.__nmInflight || new Map(); // url → Promise

function nmCacheKey(url) {
  const tokenKey = window.nmConnectionMode() === "custom" && window.nmGetNotionToken()
    ? window.nmGetNotionToken().slice(-8)
    : window.nmConnectionMode();
  return `${url}::${tokenKey}`;
}

/**
 * nmFetch(url, { ttl }) — returns a Promise for {json}.
 * If cache has an entry, returns it immediately (Promise.resolve) AND triggers
 * background revalidate when stale. Otherwise does a network fetch.
 */
window.nmFetch = function nmFetch(url, opts = {}) {
  const ttl = opts.ttl == null ? 30000 : opts.ttl;
  const now = Date.now();
  const key = nmCacheKey(url);
  const cached = window.__nmCache.get(key);

  const revalidate = () => {
    if (window.__nmInflight.has(key)) return window.__nmInflight.get(key);
    const p = fetch(url)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data != null) {
          window.__nmCache.set(key, { data, at: Date.now() });
          window.dispatchEvent(new CustomEvent("nm-cache-update", { detail: { url, data } }));
        }
        window.__nmInflight.delete(key);
        return data;
      })
      .catch(err => {
        window.__nmInflight.delete(key);
        return cached?.data ?? null;
      });
    window.__nmInflight.set(key, p);
    return p;
  };

  if (cached) {
    const isStale = (now - cached.at) > ttl;
    if (isStale) revalidate(); // fire-and-forget background refresh
    return Promise.resolve(cached.data);
  }
  return revalidate();
};

/** Invalidate one URL or all URLs matching a prefix. */
window.nmInvalidate = function nmInvalidate(urlOrPrefix) {
  if (!urlOrPrefix) { window.__nmCache.clear(); window.__nmInflight.clear(); return; }
  for (const k of Array.from(window.__nmCache.keys())) {
    if (k === urlOrPrefix || k.startsWith(urlOrPrefix)) window.__nmCache.delete(k);
  }
};

/** React hook — returns current cached data, updates on revalidate. */
window.useNmFetch = function useNmFetch(url, opts = {}) {
  const initial = url ? (window.__nmCache.get(nmCacheKey(url))?.data ?? null) : null;
  const [data, setData] = useState(initial);
  useEffect(() => {
    if (!url) return;
    let mounted = true;
    window.nmFetch(url, opts).then(d => { if (mounted && d != null) setData(d); });
    const onUpdate = (e) => {
      if (e.detail.url === url && mounted) setData(e.detail.data);
    };
    window.addEventListener("nm-cache-update", onUpdate);
    return () => { mounted = false; window.removeEventListener("nm-cache-update", onUpdate); };
  }, [url]);
  return data;
};

window.nmToast = function nmToast(message) {
  window.dispatchEvent(new CustomEvent("nm-toast", { detail: { message } }));
};

window.nmCopyText = async function nmCopyText(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {}
  return false;
};

window.nmLoadRecentPages = function nmLoadRecentPages(limit = 4) {
  try {
    const rows = JSON.parse(localStorage.getItem("nm-recent-pages") || "[]");
    return Array.isArray(rows)
      ? rows.filter(r => r && r.id).slice(0, limit)
      : [];
  } catch {
    return [];
  }
};

window.nmTrackRecentPage = function nmTrackRecentPage(page) {
  if (!page?.id) return;
  const row = {
    id: page.id,
    n: page.title || page.n || "(제목 없음)",
    sub: page.sub || page.category || page.dbTitle || "페이지",
    icon: page.icon || "📄",
    at: Date.now(),
  };
  let rows = [];
  try { rows = JSON.parse(localStorage.getItem("nm-recent-pages") || "[]"); } catch {}
  if (!Array.isArray(rows)) rows = [];
  rows = [row, ...rows.filter(r => r?.id !== row.id)].slice(0, 20);
  localStorage.setItem("nm-recent-pages", JSON.stringify(rows));
  window.dispatchEvent(new CustomEvent("nm-recent-update", { detail: row }));
};

window.nmRemoveRecentPage = function nmRemoveRecentPage(pageId) {
  if (!pageId) return;
  let rows = [];
  try { rows = JSON.parse(localStorage.getItem("nm-recent-pages") || "[]"); } catch {}
  if (!Array.isArray(rows)) return;
  rows = rows.filter(r => r?.id !== pageId);
  localStorage.setItem("nm-recent-pages", JSON.stringify(rows));
  window.dispatchEvent(new CustomEvent("nm-recent-update", { detail: null }));
};

/* ── Icons (SF Symbol style, stroke 1.8) ─────────────── */
function Icon({ name, size = 22, color = "currentColor", strokeWidth = 1.8 }) {
  const s = { width: size, height: size, display: "inline-block", flexShrink: 0 };
  const p = { stroke: color, strokeWidth, fill: "none", strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "home":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M3 10 L11 3 L19 10 V18 a1 1 0 0 1 -1 1 H13 V13 H9 V19 H4 a1 1 0 0 1 -1 -1 Z"/></svg>;
    case "search":  return <svg style={s} viewBox="0 0 22 22"><circle {...p} cx="10" cy="10" r="6"/><path {...p} d="M15 15 L19 19"/></svg>;
    case "calendar":return <svg style={s} viewBox="0 0 22 22"><rect {...p} x="3" y="5" width="16" height="14" rx="2.5"/><path {...p} d="M3 9 H19 M7 3 V6 M15 3 V6"/></svg>;
    case "inbox":   return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M3 13 V17 a2 2 0 0 0 2 2 H17 a2 2 0 0 0 2 -2 V13 M3 13 L5 5 a2 2 0 0 1 2 -1.5 H15 a2 2 0 0 1 2 1.5 L19 13 M3 13 H7 L8.5 15 H13.5 L15 13 H19"/></svg>;
    case "person":  return <svg style={s} viewBox="0 0 22 22"><circle {...p} cx="11" cy="8" r="3.5"/><path {...p} d="M4 19 Q 11 13 18 19"/></svg>;
    case "plus":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M11 4 V18 M4 11 H18"/></svg>;
    case "close":   return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M5 5 L17 17 M17 5 L5 17"/></svg>;
    case "back":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M13 5 L6 11 L13 17"/></svg>;
    case "more":    return <svg style={s} viewBox="0 0 22 22"><circle cx="5" cy="11" r="1.6" fill={color}/><circle cx="11" cy="11" r="1.6" fill={color}/><circle cx="17" cy="11" r="1.6" fill={color}/></svg>;
    case "filter":  return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M3 6 H19 M6 11 H16 M9 16 H13"/></svg>;
    case "share":   return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M11 3 V14 M7 7 L11 3 L15 7 M4 14 V18 a1 1 0 0 0 1 1 H17 a1 1 0 0 0 1 -1 V14"/></svg>;
    case "link":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M9 7 L10.5 5.5 a4 4 0 0 1 5.7 5.7 L14.5 13 M13 15 L11.5 16.5 a4 4 0 0 1 -5.7 -5.7 L7.5 9 M8.5 13.5 L13.5 8.5"/></svg>;
    case "chev-r":  return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M8 5 L14 11 L8 17"/></svg>;
    case "chev-d":  return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M5 8 L11 14 L17 8"/></svg>;
    case "chev-u":  return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M5 14 L11 8 L17 14"/></svg>;
    case "chev-l":  return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M14 5 L8 11 L14 17"/></svg>;
    case "check":   return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M4 11 L9 16 L18 6"/></svg>;
    case "menu":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M3 6 H19 M3 11 H19 M3 16 H19"/></svg>;
    case "clock":   return <svg style={s} viewBox="0 0 22 22"><circle {...p} cx="11" cy="11" r="7.5"/><path {...p} d="M11 6 V11 L14.5 13"/></svg>;
    case "location":return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M11 20 Q 4 13 4 9 a7 7 0 0 1 14 0 Q 18 13 11 20 Z"/><circle {...p} cx="11" cy="9" r="2.5"/></svg>;
    case "bell":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M5 16 H17 V14 L16 13 V9 a5 5 0 0 0 -10 0 V13 L5 14 Z M9 19 a2 2 0 0 0 4 0"/></svg>;
    case "tag":     return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M11 3 H18 V10 L10 18 L3 11 Z"/><circle {...p} cx="14" cy="7" r="1.2"/></svg>;
    case "archive": return <svg style={s} viewBox="0 0 22 22"><rect {...p} x="3" y="4" width="16" height="4" rx="1"/><path {...p} d="M4 8 V17 a1 1 0 0 0 1 1 H17 a1 1 0 0 0 1 -1 V8 M9 12 H13"/></svg>;
    case "sparkle": return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M11 3 L12.5 8.5 L18 10 L12.5 11.5 L11 17 L9.5 11.5 L4 10 L9.5 8.5 Z"/></svg>;
    case "database":return <svg style={s} viewBox="0 0 22 22"><ellipse {...p} cx="11" cy="5.5" rx="7" ry="2.5"/><path {...p} d="M4 5.5 V11 Q 4 13.5 11 13.5 Q 18 13.5 18 11 V5.5 M4 11 V16.5 Q 4 19 11 19 Q 18 19 18 16.5 V11"/></svg>;
    case "grid":    return <svg style={s} viewBox="0 0 22 22"><rect {...p} x="3" y="3" width="7" height="7" rx="1.2"/><rect {...p} x="12" y="3" width="7" height="7" rx="1.2"/><rect {...p} x="3" y="12" width="7" height="7" rx="1.2"/><rect {...p} x="12" y="12" width="7" height="7" rx="1.2"/></svg>;
    case "list":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M7 6 H19 M7 11 H19 M7 16 H19"/><circle cx="4" cy="6" r="1.2" fill={color}/><circle cx="4" cy="11" r="1.2" fill={color}/><circle cx="4" cy="16" r="1.2" fill={color}/></svg>;
    case "settings":return <svg style={s} viewBox="0 0 22 22"><circle {...p} cx="11" cy="11" r="3"/><path {...p} d="M11 2 V4 M11 18 V20 M20 11 H18 M4 11 H2 M17.4 4.6 L16 6 M6 16 L4.6 17.4 M17.4 17.4 L16 16 M6 6 L4.6 4.6"/></svg>;
    case "lock":    return <svg style={s} viewBox="0 0 22 22"><rect {...p} x="4" y="10" width="14" height="9" rx="2"/><path {...p} d="M7 10 V7 a4 4 0 0 1 8 0 V10"/></svg>;
    case "sync":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M4 11 a7 7 0 0 1 12 -5 L18 4 V8 H14 M18 11 a7 7 0 0 1 -12 5 L4 18 V14 H8"/></svg>;
    case "moon":    return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M18.5 14.5 A8 8 0 0 1 7.5 3.5 a8 8 0 1 0 11 11 Z"/></svg>;
    case "sun":     return <svg style={s} viewBox="0 0 22 22"><circle {...p} cx="11" cy="11" r="4"/><path {...p} d="M11 2 V4 M11 18 V20 M20 11 H18 M4 11 H2 M17.4 4.6 L16 6 M6 16 L4.6 17.4 M17.4 17.4 L16 16 M6 6 L4.6 4.6"/></svg>;
    case "pencil":  return <svg style={s} viewBox="0 0 22 22"><path {...p} d="M3 19 L5 13 L15 3 L19 7 L9 17 Z M13 5 L17 9 M3 19 H9"/></svg>;
    case "ellipsis": return <svg style={s} viewBox="0 0 22 22"><circle cx="5" cy="11" r="1.6" fill={color}/><circle cx="11" cy="11" r="1.6" fill={color}/><circle cx="17" cy="11" r="1.6" fill={color}/></svg>;
    default: return null;
  }
}

/* ── iOS status bar, home indicator ──────────────────── */
function StatusBar() {
  return (
    <div style={{
      position: "absolute", top: 0, left: 0, right: 0, height: 54,
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "17px 30px 0", zIndex: 50, pointerEvents: "none",
      fontSize: 16, fontWeight: 600, color: "var(--n-text-strong)",
      fontVariantNumeric: "tabular-nums", letterSpacing: -0.2,
    }}>
      <span>9:41</span>
      {/* Dynamic Island */}
      <div style={{position: "absolute", left: "50%", top: 11, transform: "translateX(-50%)", width: 110, height: 32, borderRadius: 20, background: "#000"}}/>
      <div style={{display: "flex", alignItems: "center", gap: 6}}>
        <svg width="17" height="11" viewBox="0 0 17 11"><path d="M0.5 9 h2 v1.5 h-2 z M4 7 h2 v3.5 h-2 z M7.5 5 h2 v5.5 h-2 z M11 2.5 h2 v8 h-2 z" fill="currentColor"/></svg>
        <svg width="25" height="11" viewBox="0 0 25 11"><rect x="0.5" y="0.5" width="21" height="10" rx="2.5" fill="none" stroke="currentColor" strokeOpacity="0.4"/><rect x="2" y="2" width="18" height="7" rx="1.4" fill="currentColor"/><rect x="22.2" y="3.5" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>
      </div>
    </div>
  );
}
function HomeIndicator() {
  return (
    <div style={{position: "absolute", bottom: 7, left: "50%", transform: "translateX(-50%)", width: 134, height: 5, borderRadius: 3, background: "var(--n-text-strong)", opacity: 0.85, zIndex: 60}}/>
  );
}

/* ── Phone frame (desktop: 402×874 bezel, mobile: fullscreen) ───────── */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(max-width: 500px)").matches;
  });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 500px)");
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  return isMobile;
}

function Phone({ children, dark, style }) {
  const isMobile = useIsMobile();
  const frame = isMobile
    ? {
        position: "fixed",
        inset: 0,
        width: "100dvw",
        height: "var(--nm-app-height, 100dvh)",
        minHeight: "var(--nm-app-height, 100dvh)",
        borderRadius: 0,
        overflow: "hidden",
        background: "var(--n-bg-grouped)", boxShadow: "none",
        ...style,
      }
    : {
        width: 402, height: 874, borderRadius: 56,
        overflow: "hidden", position: "relative",
        background: "var(--n-bg-grouped)",
        boxShadow: "0 40px 80px rgba(0,0,0,0.15), 0 0 0 10px #1a1a1a, 0 0 0 11px rgba(0,0,0,0.3)",
        ...style,
      };
  return (
    <div className="phone" style={frame} data-is-mobile={isMobile ? "1" : "0"}>
      {!isMobile && <StatusBar/>}
      <div style={{position: "absolute", top: 0, bottom: 0, left: 0, right: 0, display: "flex", flexDirection: "column"}}>
        {children}
      </div>
      <ToastHost/>
      {!isMobile && <HomeIndicator/>}
    </div>
  );
}

/* ── iOS 26 large-title nav bar (scroll-aware-ready) ─── */
function NavBar({ title, large = true, left, right, subtitle, onScrollCollapse = false }) {
  return (
    <div style={{
      paddingTop: "var(--nm-nav-top, 54px)",
      background: onScrollCollapse ? "transparent" : "var(--n-bg-grouped)",
    }}>
      {/* position: relative so absolutely-positioned compact title is scoped to
          this row (not the Phone container — that would place it under the notch). */}
      <div style={{position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 12px", minHeight: 44}}>
        <div style={{display: "flex", alignItems: "center", gap: 4}}>{left}</div>
        {!large && (
          <div
            className="t-headline"
            style={{
              position: "absolute",
              left: 0, right: 0, top: 0, bottom: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              textAlign: "center", pointerEvents: "none",
            }}
          ><span style={{pointerEvents: "auto"}}>{title}</span></div>
        )}
        <div style={{display: "flex", alignItems: "center", gap: 4}}>{right}</div>
      </div>
      {large && (
        <div style={{padding: "4px 20px 10px"}}>
          {subtitle && <div className="t-footnote" style={{marginBottom: 2}}>{subtitle}</div>}
          <div className="t-large-title">{title}</div>
        </div>
      )}
    </div>
  );
}

/* ── Round icon button (for nav) ─────────────────────── */
function NavIconBtn({ icon, onClick, badge }) {
  return (
    <button onClick={onClick} style={{
      width: 36, height: 36, borderRadius: 18,
      background: "var(--n-surface-hover)",
      border: "none", cursor: "pointer",
      display: "grid", placeItems: "center",
      color: "var(--n-text-strong)",
      position: "relative",
    }}>
      <Icon name={icon} size={18}/>
      {badge && <span style={{position: "absolute", top: 2, right: 2, width: 8, height: 8, borderRadius: 4, background: "var(--n-accent)", border: "1.5px solid var(--n-bg-grouped)"}}/>}
    </button>
  );
}

/* ── Liquid-glass bottom tab bar ─────────────────────── */
function TabBar({ active = 0, onChange }) {
  const items = [
    { icon: "home", label: t("홈") },
    { icon: "search", label: t("검색") },
    { icon: "plus", label: t("새로") },
    { icon: "inbox", label: t("인박스") },
    { icon: "person", label: t("나") },
  ];
  return (
    <>
      <div className="tabbar-backdrop" aria-hidden="true" />
      <div className="tabbar glass">
        {items.map((it, i) => (
          <div key={i} className={"tab-item" + (active === i ? " on" : "")} onClick={() => onChange && onChange(i)}>
            <Icon name={it.icon} size={22}/>
            <span>{it.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

/* ── Toggle switch (iOS) ─────────────────────────────── */
function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange && onChange(!on)} style={{
      width: 51, height: 31, borderRadius: 16,
      background: on ? "#34C759" : "var(--n-surface-press)",
      border: "none", cursor: "pointer", position: "relative",
      transition: "background var(--d-fast)",
    }}>
      <span style={{
        position: "absolute", top: 2, left: on ? 22 : 2,
        width: 27, height: 27, borderRadius: "50%",
        background: "#FFFFFF",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2), 0 0 1px rgba(0,0,0,0.3)",
        transition: "left var(--d-fast) var(--e-out)",
      }}/>
    </button>
  );
}

/* ── Spacer for scroll content above tab bar ─────────── */
function TabSpacer() { return <div style={{height: "var(--nm-tabbar-space, 100px)"}}/>; }

function ActionSheet({ open, title, subtitle, onClose, children }) {
  if (!open) return null;
  return (
    <>
      <div
        onClick={onClose}
        style={{position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)", zIndex: 80}}
      />
      <div
        className="glass"
        style={{
          position: "absolute", left: 10, right: 10,
          bottom: "calc(10px + var(--safe-b, env(safe-area-inset-bottom, 0px)))",
          zIndex: 81,
          borderRadius: 24, padding: "8px 0 12px",
          overflow: "hidden",
          maxHeight: "calc(var(--nm-app-height, 100dvh) - var(--safe-b, 0px) - 80px)",
          display: "flex", flexDirection: "column",
        }}
      >
        <div style={{display: "grid", placeItems: "center", padding: "4px 0 8px"}}>
          <div style={{width: 36, height: 5, borderRadius: 3, background: "var(--n-border-strong)"}}/>
        </div>
        {(title || subtitle) && (
          <div style={{padding: "0 18px 12px", display: "flex", alignItems: "flex-start", gap: 12}}>
            <div style={{flex: 1, minWidth: 0}}>
              {title && <div className="t-headline">{title}</div>}
              {subtitle && <div className="t-footnote" style={{marginTop: 2}}>{subtitle}</div>}
            </div>
            <NavIconBtn icon="close" onClick={onClose}/>
          </div>
        )}
        <div style={{overflowY: "auto"}}>{children}</div>
      </div>
    </>
  );
}

function ActionRow({ icon, title, subtitle, tone = "default", onClick, right }) {
  const color = tone === "danger" ? "#D44C47" : "var(--n-text-strong)";
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%", minHeight: 54, display: "flex", alignItems: "center", gap: 12,
        padding: "10px 18px", border: "none", background: "transparent",
        color, font: "inherit", textAlign: "left", cursor: "pointer",
      }}
    >
      {icon && <Icon name={icon} size={19} color={color}/>}
      <span style={{flex: 1, minWidth: 0}}>
        <span className="t-body" style={{display: "block", fontWeight: 600, color}}>{title}</span>
        {subtitle && <span className="t-footnote" style={{display: "block", marginTop: 1}}>{subtitle}</span>}
      </span>
      {right}
    </button>
  );
}

function ToastHost() {
  const [msg, setMsg] = useState("");
  useEffect(() => {
    let timer;
    const onToast = (e) => {
      setMsg(e.detail?.message || "");
      clearTimeout(timer);
      timer = setTimeout(() => setMsg(""), 1800);
    };
    window.addEventListener("nm-toast", onToast);
    return () => { clearTimeout(timer); window.removeEventListener("nm-toast", onToast); };
  }, []);
  if (!msg) return null;
  return (
    <div
      className="glass"
      style={{
        position: "absolute", left: "50%", bottom: 88, transform: "translateX(-50%)",
        zIndex: 90, borderRadius: 18, padding: "9px 14px",
        maxWidth: "78%", color: "var(--n-text-strong)", fontSize: 13, fontWeight: 600,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}
    >{msg}</div>
  );
}

/* ── Avatar ──────────────────────────────────────────── */
function Avatar({ name, size = 24, color }) {
  const colors = ["#E69C6E", "#8FA37E", "#6A8CAB", "#B57CAE", "#A8925A"];
  const bg = color || colors[(name || "A").charCodeAt(0) % colors.length];
  return (
    <div className="avatar" style={{width: size, height: size, background: bg, color: "#fff", fontSize: size * 0.42, borderColor: "transparent"}}>
      {(name || "?").slice(0,1).toUpperCase()}
    </div>
  );
}

Object.assign(window, {
  Icon, StatusBar, HomeIndicator, Phone, NavBar, NavIconBtn, TabBar, Toggle, TabSpacer, Avatar,
  ActionSheet, ActionRow, ToastHost,
});
