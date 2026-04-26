/* Onboarding + Token connection + Home + Search
   Screens: onboarding, token, db-picker, home, search */
const { useState: uS1, useEffect: uE1 } = React;

function OnboardingScreen({ go, goBack }) {
  const [step, setStep] = uS1(0);
  const steps = [
    { k: "모바일에서도\n편안한 Notion", d: "가로로 흘러가는 표, 점만 찍히는 캘린더를 모바일에 맞게 다시 짰어요.", emoji: "🪶" },
    { k: "필요한 DB만\n한눈에", d: "자주 쓰는 데이터베이스를 홈에 핀하고, 가볍게 스와이프로 전환하세요.", emoji: "📚" },
    { k: "한 줄로 빠르게\n일정 등록", d: "'내일 10시 리뷰'처럼 자연어 한 줄이면 끝. FAB으로 어디서든.", emoji: "✳" },
  ];
  const s = steps[step];
  return (
    <div style={{position: "absolute", inset: 0, display: "flex", flexDirection: "column", padding: "84px 28px 36px"}}>
      <div style={{flex: 1, display: "flex", flexDirection: "column", justifyContent: "center"}}>
        <div style={{fontSize: 72, marginBottom: 32}}>{s.emoji}</div>
        <div className="t-large-title" style={{whiteSpace: "pre-line", fontSize: 34, lineHeight: "40px"}}>{s.k}</div>
        <div className="t-body muted" style={{marginTop: 14, maxWidth: 320}}>{s.d}</div>
      </div>
      <div style={{display: "flex", gap: 6, justifyContent: "center", marginBottom: 22}}>
        {steps.map((_, i) => (
          <div key={i} style={{width: i === step ? 22 : 6, height: 6, borderRadius: 3, background: i === step ? "var(--n-accent)" : "var(--n-border-strong)", transition: "width var(--d-base) var(--e-out)"}}/>
        ))}
      </div>
      <button className="btn btn--primary" style={{width: "100%"}} onClick={() => {
        if (step < steps.length - 1) setStep(step + 1);
        else go("token");
      }}>{step < steps.length - 1 ? "계속" : "Notion 연결하기"}</button>
      <button className="btn btn--ghost" style={{marginTop: 8, width: "100%"}} onClick={() => {
        window.nmSetConnection && window.nmSetConnection("demo");
        go("home");
      }}>둘러보기</button>
    </div>
  );
}

function TokenScreen({ go, goBack }) {
  const [val, setVal] = uS1("");
  const [connecting, setConnecting] = uS1(false);
  const [error, setError] = uS1("");
  const [profile, setProfile] = uS1(null);
  const [connected, setConnected] = uS1(false);
  const [oauthConfigured, setOauthConfigured] = uS1(() => localStorage.getItem("nm-oauth-configured") === "1");

  uE1(() => {
    const storedMode = localStorage.getItem("nm-connection-mode");
    const storedName = localStorage.getItem("nm-profile-workspace") || localStorage.getItem("nm-profile-name");
    if ((storedMode === "custom" || storedMode === "oauth") && storedName) {
      let mappingCount = 0;
      try { mappingCount = Object.keys(window.nmLoadCoreDbMap?.() || {}).length; } catch {}
      setConnected(true);
      setProfile({ name: storedName, databaseCount: mappingCount });
    }
    window.nmRefreshSession?.().then(s => {
      if (s?.oauthConfigured != null) setOauthConfigured(!!s.oauthConfigured);
      if (s?.connected) {
        setConnected(true);
        setProfile({ name: s.profile?.workspaceName || "Connected Notion", databaseCount: Object.keys(window.nmLoadCoreDbMap?.() || {}).length });
      }
    });
  }, []);

  const connect = async () => {
    const token = val.trim();
    if (!token || connecting) return;
    setConnecting(true);
    setError("");
    try {
      const res = await fetch("/api/notion/session", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ token }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Notion 연결에 실패했습니다.");
      localStorage.setItem("nm-notion-profile", JSON.stringify(json.profile || {}));
      if (json.profile?.name) localStorage.setItem("nm-profile-name", json.profile.name);
      localStorage.setItem("nm-profile-workspace", "Connected Notion");
      window.nmSetConnection && window.nmSetConnection("custom", token);
      setConnected(true);
      setProfile(json.profile || null);
      go("db-picker");
    } catch (err) {
      const message = err?.message || "";
      setError(message === "Failed to fetch"
        ? "앱 서버에 연결할 수 없습니다. 로컬에서는 npm run dev가 실행 중인지 확인한 뒤 다시 시도해주세요."
        : message || "토큰을 확인해주세요.");
    } finally {
      setConnecting(false);
    }
  };

  const continueNext = () => {
    if (connected && !val.trim()) {
      go("db-picker");
      return;
    }
    connect();
  };

  return (
    <>
      <NavBar title="API 연결" large={false} left={<NavIconBtn icon="back" onClick={goBack}/>}/>
      <div style={{flex: 1, overflowY: "auto", padding: "0 0 40px"}}>
        <div style={{padding: "0 20px 24px"}}>
          <div className="t-title-1" style={{marginBottom: 8}}>Notion 로그인</div>
          <div className="t-body muted">
            OAuth로 워크스페이스를 연결하면 토큰을 브라우저에 노출하지 않고 이 앱에서 Notion을 사용할 수 있어요.
          </div>
        </div>
        <div style={{padding: "0 20px 18px"}}>
          <button
            className="btn btn--primary"
            style={{width: "100%"}}
            disabled={!oauthConfigured}
            onClick={() => {
              if (connected) go("db-picker");
              else window.location.href = "/api/oauth/notion/start";
            }}
          >
            {connected ? "연결된 워크스페이스 계속" : "Notion으로 계속"}
          </button>
          {!oauthConfigured && (
            <div className="t-footnote" style={{marginTop: 10, color: "#A5483D", lineHeight: 1.5}}>
              OAuth 환경변수가 아직 설정되지 않았습니다. Vercel에 OAuth client id/secret을 넣으면 이 버튼이 활성화됩니다.
            </div>
          )}
        </div>

        <div className="g-header">고급 · INTERNAL INTEGRATION TOKEN</div>
        <div className="g-list">
          <div className="g-row" style={{padding: 16}}>
            <input className="input" placeholder="ntn_... 또는 secret_..." value={val}
              onChange={e => setVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") connect(); }}
              style={{background: "transparent", padding: 0, fontFamily: "var(--f-mono)", fontSize: 14}}/>
          </div>
        </div>
        <div style={{display: "flex", gap: 8, padding: "12px 20px 0"}}>
          <button className="btn btn--sm" onClick={async () => {
            try {
              const text = await navigator.clipboard?.readText?.();
              if (text) setVal(text.trim());
            } catch {
              window.nmToast && window.nmToast("클립보드 권한을 확인해주세요.");
            }
          }}>붙여넣기</button>
          <button className="btn btn--sm" onClick={() => window.open("https://www.notion.so/my-integrations", "_blank")}>토큰 만들기</button>
          <button className="btn btn--sm" onClick={() => {
            window.nmSetConnection && window.nmSetConnection("demo");
            go("home");
          }}>데모 보기</button>
        </div>

        <div className="g-header" style={{marginTop: 24}}>연결 상태</div>
        <div className="g-list">
          <div className="g-row g-row--with-icon" style={{padding: "14px 16px"}}>
            <div className="icon-tile icon-tile--lg" style={{background: profile ? "#DDEDEA" : "#F1F1EF", color: profile ? "#448361" : "#787774"}}>{profile ? "✓" : "N"}</div>
            <div style={{flex: 1}}>
              <div className="t-headline">{profile?.name || "아직 연결되지 않음"}</div>
              <div className="t-footnote">{profile ? `${profile.databaseCount || 0}개 매핑됨 · 다음으로 DB를 선택하세요` : "토큰 검증 후 DB 선택으로 이동합니다"}</div>
            </div>
          </div>
        </div>
        {error && (
          <div style={{padding: "12px 20px 0"}}>
            <div className="t-footnote" style={{background: "#FDEBEC", color: "#A5483D", padding: 12, borderRadius: 10, lineHeight: 1.5}}>
              {error}
            </div>
          </div>
        )}

        <div style={{padding: "20px", marginTop: 8}}>
          <div className="t-footnote" style={{background: "var(--n-surface-hover)", padding: 12, borderRadius: 10, lineHeight: 1.5}}>
            OAuth 세션은 서버 전용 쿠키에 저장됩니다. 고급 토큰 방식은 이 브라우저에 토큰이 저장되므로 개인 테스트용으로만 쓰는 것을 권장합니다.
          </div>
        </div>
      </div>
      <div style={{padding: "12px 20px 28px", background: "var(--n-bg-grouped)"}}>
        <button className="btn btn--primary" style={{width: "100%"}} onClick={continueNext} disabled={(!connected && !val.trim()) || connecting}>
          {connecting ? "연결 확인 중..." : connected && !val.trim() ? "다음 · DB 선택" : "연결하고 DB 선택"}
        </button>
      </div>
    </>
  );
}

function DbPickerScreen({ go, goBack }) {
  const [dbs, setDbs] = uS1([]);
  const [loading, setLoading] = uS1(true);
  const [pinned, setPinned] = uS1(() => {
    const ids = new Set();
    try {
      const raw = localStorage.getItem("nm-pinned-dbs");
      (raw ? JSON.parse(raw) : []).forEach(id => ids.add(id));
    } catch {}
    getHomePinnedDbIds().forEach(id => ids.add(id));
    return ids;
  });
  const [query, setQuery] = uS1("");

  uE1(() => {
    const cached = readDbListCache();
    if (cached && cached.length) {
      setDbs(cached);
      setLoading(false);
    }
    loadDbList({ force: true })
      .then(list => {
        setDbs(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const togglePin = async (id) => {
    const db = dbs.find(x => x.id === id);
    const next = new Set(pinned);
    const pinning = !next.has(id);
    pinning ? next.add(id) : next.delete(id);
    setPinned(next);
    localStorage.setItem("nm-pinned-dbs", JSON.stringify([...next]));

    if (pinning) {
      addDbToHome(db);
      await autoAssignDbRoles(db, true);
    } else {
      removeDbFromHome(id);
      await autoAssignDbRoles(db, false);
    }
  };

  const visible = (query.trim()
    ? dbs.filter(d => d.title.toLowerCase().includes(query.toLowerCase()))
    : dbs
  ).filter(d => d.title && d.title !== "(이름 없음)").slice().sort((a, b) => {
    const ap = pinned.has(a.id) ? 0 : 1;
    const bp = pinned.has(b.id) ? 0 : 1;
    if (ap !== bp) return ap - bp;
    return a.title.localeCompare(b.title);
  });
  const count = pinned.size;

  return (
    <>
      <NavBar title="사용할 DB 선택" large={false}
        left={<NavIconBtn icon="back" onClick={goBack}/>}
        right={<button className="btn btn--sm btn--primary" onClick={() => go("home")} style={{padding: "6px 14px"}}>완료</button>}
      />
      <div style={{flex: 1, overflowY: "auto"}} className="scroll-fade">
        <div className="t-footnote muted" style={{padding: "4px 20px 12px", background: "var(--n-surface-hover)", margin: "8px 16px 12px", borderRadius: 10, paddingTop: 10, lineHeight: 1.5}}>
          토글 ON → 홈에 원본 DB 카드가 추가되고, DB 특성에 맞는 모바일 뷰가 자동 추천됩니다.<br/>
          Notion에서 선택 권한을 준 DB만 표시됩니다.
        </div>

        {/* Search */}
        <div style={{padding: "0 16px 10px"}}>
          <div className="input" style={{display: "flex", alignItems: "center", gap: 8, padding: "10px 12px"}}>
            <Icon name="search" size={16} color="var(--n-text-muted)"/>
            <input
              placeholder="DB 이름으로 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--n-text)", fontFamily: "inherit"}}
            />
            {query && <button onClick={() => setQuery("")} style={{border: "none", background: "transparent", cursor: "pointer", color: "var(--n-text-muted)", padding: 0}}><Icon name="close" size={14}/></button>}
          </div>
        </div>

        {loading ? (
          <div style={{padding: "40px 20px", textAlign: "center", color: "var(--n-text-muted)"}}>DB 목록 불러오는 중...</div>
        ) : visible.length === 0 ? (
          <div style={{padding: "32px 20px", textAlign: "center"}}>
            <div className="t-headline" style={{marginBottom: 8}}>
              {query.trim() ? "표시할 DB가 없어요" : window.NM_EMPTY_DB_MESSAGE}
            </div>
            <div className="t-footnote muted" style={{lineHeight: 1.55, maxWidth: 280, margin: "0 auto 16px"}}>
              {query.trim()
                ? "검색어와 일치하는 데이터베이스가 없습니다."
                : "Notion에서 데이터베이스가 들어있는 페이지를 이 앱에 공유하면 목록에 표시됩니다."}
            </div>
            <div style={{display: "flex", flexDirection: "column", gap: 8}}>
              <button className="btn btn--primary" onClick={() => {
                window.nmInvalidate && window.nmInvalidate("/api/databases");
                window.location.href = "/api/oauth/notion/start";
              }}>
                Notion 권한 다시 선택
              </button>
              <button className="btn" onClick={() => go("token")}>API 연결로 돌아가기</button>
            </div>
          </div>
        ) : (
          <div className="g-list">
            {visible.map(d => {
              const roles = window.nmInferDbRoles?.(d) || [];
              return (
                <div key={d.id} className="g-row g-row--with-icon" style={{alignItems: "flex-start"}}>
                  <div className="icon-tile icon-tile--lg" style={{background: "var(--n-surface-hover)", fontSize: 18}}>
                    {d.icon && /^https?:\/\//.test(d.icon)
                      ? <img src={d.icon} alt="" style={{width: 24, height: 24, borderRadius: 4, objectFit: "cover"}}/>
                      : (d.icon || "📦")}
                  </div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div className="t-headline" style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{d.title}</div>
                    {roles.length > 0 && (
                      <div className="t-footnote" style={{display: "flex", gap: 5, flexWrap: "wrap", marginTop: 5}}>
                        <span style={{color: "var(--n-text-muted)", padding: "2px 0"}}>추천 뷰</span>
                        {roles.slice(0, 3).map(role => (
                          <span key={role} style={{
                            padding: "2px 6px",
                            borderRadius: 7,
                            background: "var(--n-surface-hover)",
                            color: "var(--n-text-muted)",
                            fontWeight: 600,
                          }}>{roleLabel(role)}</span>
                        ))}
                      </div>
                    )}
                    <div className="t-footnote muted" style={{marginTop: 5}}>
                      {d.source === "data_source" ? "데이터 소스" : "데이터베이스"} · Notion 원본 속성 유지
                    </div>
                  </div>
                  <Toggle on={pinned.has(d.id)} onChange={() => togglePin(d.id)}/>
                </div>
              );
            })}
          </div>
        )}
        <div className="t-footnote" style={{padding: "14px 20px", textAlign: "center"}}>
          {count}개 핀됨 · 홈 DB shelf에 표시됩니다
        </div>
        <TabSpacer/>
      </div>
    </>
  );
}

const CORE_WIDGETS = [
  { key: "tasks",      dbKey: "tasks",      n: "태스크",   c: "#DDEDEA", fg: "#448361", icon: "✓",  go: "db-list", core: true },
  { key: "calendar",   dbKey: "tasks",      n: "캘린더",   c: "#DDEBF1", fg: "#337EA9", icon: "📅", go: "calendar", core: true },
  { key: "works",      dbKey: "works",      n: "웍스",     c: "#EAE4F2", fg: "#9065B0", icon: "◆",  go: "db-list", core: true },
  { key: "insights",   dbKey: "insights",   n: "인사이트", c: "#FBF3DB", fg: "#CB912F", icon: "✎",  go: "db-list", core: true },
  { key: "finance",    dbKey: "finance",    n: "가계부",   c: "#FDEBEC", fg: "#D44C47", icon: "₩",  go: "db-list", core: true },
  { key: "reflection", dbKey: "reflection", n: "스크립트", c: "#F4EEEE", fg: "#9F6B53", icon: "✐",  go: "db-list", core: true },
];

function defaultCoreWidgetsForConnection() {
  const mode = window.nmConnectionMode?.() || "demo";
  if (mode === "owner") return CORE_WIDGETS;
  return [];
}

const DB_COLOR_POOL = [
  { c: "#DDEDEA", fg: "#448361" }, // green
  { c: "#DDEBF1", fg: "#337EA9" }, // blue
  { c: "#EAE4F2", fg: "#9065B0" }, // purple
  { c: "#FBF3DB", fg: "#CB912F" }, // yellow
  { c: "#FBECDD", fg: "#D9730D" }, // orange
  { c: "#F4EEEE", fg: "#9F6B53" }, // brown
  { c: "#F4DFEB", fg: "#C14C8A" }, // pink
  { c: "#FDEBEC", fg: "#D44C47" }, // red
];
function colorForDb(id) {
  if (!id) return DB_COLOR_POOL[0];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return DB_COLOR_POOL[hash % DB_COLOR_POOL.length];
}

function dbSourceRank(source) {
  if (source === "data_source") return 3;
  if (source === "database") return 2;
  if (source === "child_database") return 1;
  return 0;
}

function dbSchemaKey(db) {
  const props = Array.isArray(db?.properties)
    ? db.properties.map(prop => `${prop.name}:${prop.type}`).sort().join("|")
    : "";
  return `${String(db?.title || "").trim().toLowerCase()}::${props}`;
}

function chooseDbListItem(current, next) {
  if (dbSourceRank(next.source) !== dbSourceRank(current.source)) {
    return dbSourceRank(next.source) > dbSourceRank(current.source) ? next : current;
  }
  return Date.parse(next.lastEditedAt || "") > Date.parse(current.lastEditedAt || "") ? next : current;
}

const DB_LIST_CACHE_VERSION = 2;

function dbQueryId(db) {
  return db?.databaseId || db?.dbId || db?.id;
}

function normalizeDbListItems(list) {
  const byKey = new Map();
  (Array.isArray(list) ? list : []).forEach(db => {
    const queryId = dbQueryId(db);
    if (!queryId || !db?.title || db.title === "(이름 없음)") return;
    const normalizedDb = {
      ...db,
      id: queryId,
      dbId: queryId,
      dataSourceId: db.dataSourceId || (db.source === "data_source" && db.id !== queryId ? db.id : db.dataSourceId),
    };
    const key = String(normalizedDb.canonicalId || normalizedDb.databaseId || normalizedDb.id).replace(/-/g, "").toLowerCase();
    if (!key) return;
    const current = byKey.get(key);
    if (!current) {
      byKey.set(key, normalizedDb);
      return;
    }
    byKey.set(key, chooseDbListItem(current, normalizedDb));
  });
  const bySchema = new Map();
  [...byKey.values()].forEach(db => {
    const key = dbSchemaKey(db);
    const current = bySchema.get(key);
    bySchema.set(key, current ? chooseDbListItem(current, db) : db);
  });
  return [...bySchema.values()].sort((a, b) => String(a.title).localeCompare(String(b.title)));
}

function readDbListCache() {
  const memory = window.__nmDbListCache && Array.isArray(window.__nmDbListCache.data)
    ? window.__nmDbListCache
    : null;
  try {
    const raw = localStorage.getItem("nm-db-list-cache");
    const parsed = raw ? JSON.parse(raw) : null;
    if (Array.isArray(parsed?.data) && parsed.version === DB_LIST_CACHE_VERSION) {
      if (memory && memory.data.length && (!parsed.at || memory.at >= parsed.at)) return normalizeDbListItems(memory.data);
      const normalized = { data: normalizeDbListItems(parsed.data), at: parsed.at };
      window.__nmDbListCache = normalized;
      return normalized.data;
    }
  } catch {}
  if (memory) return normalizeDbListItems(memory.data);
  return null;
}

function loadDbList({ force = false } = {}) {
  const cached = readDbListCache();
  if (!force && cached && cached.length) return Promise.resolve(cached);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  return fetch("/api/databases", { cache: "no-store", signal: controller.signal })
    .then(res => res.ok ? res.json() : { data: [] })
    .then(json => {
      const data = normalizeDbListItems(Array.isArray(json?.data) ? json.data : []);
      if (!data.length && cached && cached.length) return cached;
      const cache = { version: DB_LIST_CACHE_VERSION, data, at: Date.now() };
      window.__nmDbListCache = cache;
      try { localStorage.setItem("nm-db-list-cache", JSON.stringify(cache)); } catch {}
      return data;
    })
    .catch(() => cached || [])
    .finally(() => clearTimeout(timer));
}

function getPrimarySectionId() {
  const sections = loadSections();
  return sections[0]?.id || "default";
}

function getHomePinnedDbIds() {
  const ids = new Set();
  try {
    const rawPins = localStorage.getItem("nm-pinned-dbs");
    (rawPins ? JSON.parse(rawPins) : []).forEach(id => ids.add(id));
  } catch {}

  const collect = (list) => {
    if (!Array.isArray(list)) return;
    list.forEach(w => {
      if (w?.dbId) ids.add(w.dbId);
    });
  };

  loadSections().forEach(sec => {
    try {
      const raw = localStorage.getItem(`nm-section-${sec.id}-widgets`);
      collect(raw ? JSON.parse(raw) : (sec.id === "default" ? defaultCoreWidgetsForConnection() : []));
    } catch {}
  });

  try {
    const legacyRaw = localStorage.getItem("nm-home-widgets");
    collect(legacyRaw ? JSON.parse(legacyRaw) : []);
  } catch {}
  return ids;
}

function makeDbWidget(db) {
  const id = dbQueryId(db);
  const col = colorForDb(id);
  const roles = window.nmInferDbRoles?.(db) || [];
  const role = roles[0] || "database";
  return {
    key: `db-${id}`,
    dbId: id,
    dataSourceId: db?.dataSourceId || null,
    dbKey: null,
    role,
    n: db.title || "(이름 없음)",
    c: col.c,
    fg: col.fg,
    icon: db.icon || "📦",
    sub: "",
    go: "db-list",
  };
}

function roleLabel(role) {
  return ({
    tasks: "태스크",
    calendar: "캘린더",
    works: "워크",
    insights: "인사이트",
    finance: "가계부",
    reflection: "메모",
    database: "DB",
  })[role] || "DB";
}

async function autoAssignDbRoles(db, pinning) {
  const id = dbQueryId(db);
  if (!id || !window.nmSaveDbMapping || (window.nmConnectionMode?.() || "demo") === "owner") return;
  const inferred = window.nmInferDbRoles?.(db) || [];
  const roles = inferred.includes("tasks") && inferred.includes("calendar")
    ? inferred.filter(role => role === "tasks" || role === "calendar")
    : inferred.slice(0, 1);
  const current = window.nmLoadCoreDbMap?.() || {};
  const next = { ...current };
  let changed = false;

  if (pinning) {
    roles.forEach(role => {
      if (!next[role]) {
        next[role] = id;
        changed = true;
      }
    });
  } else {
    Object.entries(next).forEach(([role, mappedId]) => {
      if (mappedId === id || mappedId === db.id || mappedId === db.dbId || mappedId === db.databaseId || mappedId === db.dataSourceId) {
        delete next[role];
        changed = true;
      }
    });
  }

  if (changed) await window.nmSaveDbMapping(next);
}

function addDbToHome(db) {
  const id = dbQueryId(db);
  if (!id) return;
  const sectionId = getPrimarySectionId();
  const list = loadSectionWidgets(sectionId);
  const next = [...list];

  const key = `db-${id}`;
  if (!next.some(w => w.key === key || w.dbId === id || w.dbId === db.id || w.dataSourceId === db.id)) next.push(makeDbWidget(db));

  saveSectionWidgets(sectionId, next);
  try {
    const pins = new Set(JSON.parse(localStorage.getItem("nm-pinned-dbs") || "[]"));
    pins.add(id);
    localStorage.setItem("nm-pinned-dbs", JSON.stringify([...pins]));
  } catch {}
  window.dispatchEvent(new CustomEvent("nm-section-update", { detail: { sectionId } }));
  window.dispatchEvent(new CustomEvent("nm-home-widgets-update", { detail: { sectionId } }));
}

async function hydrateMappedDbCardsToHome() {
  if ((window.nmConnectionMode?.() || "demo") === "owner") return false;
  const map = window.nmLoadCoreDbMap?.() || {};
  const ids = [...new Set(Object.values(map).filter(Boolean))];
  if (!ids.length) return false;

  const sectionId = getPrimarySectionId();
  const existing = loadSectionWidgets(sectionId);
  const existingIds = new Set(existing.map(w => w?.dbId).filter(Boolean));
  const missingIds = ids.filter(id => !existingIds.has(id));
  if (!missingIds.length) return false;

  const dbList = await loadDbList({ force: false });
  const byId = new Map();
  dbList.forEach(db => {
    [db.id, db.dbId, db.databaseId, db.dataSourceId].filter(Boolean).forEach(id => byId.set(id, db));
  });
  const byCanonical = new Map(dbList.map(db => [String(db.canonicalId || db.databaseId || db.id).replace(/-/g, "").toLowerCase(), db]));
  const next = existing.slice();

  missingIds.forEach(id => {
    const normalized = String(id).replace(/-/g, "").toLowerCase();
    const db = byId.get(id) || byCanonical.get(normalized);
    if (db) next.push(makeDbWidget(db));
  });

  if (next.length === existing.length) return false;
  saveSectionWidgets(sectionId, next);
  try {
    const pins = new Set(JSON.parse(localStorage.getItem("nm-pinned-dbs") || "[]"));
    next.forEach(w => { if (w?.dbId) pins.add(w.dbId); });
    localStorage.setItem("nm-pinned-dbs", JSON.stringify([...pins]));
  } catch {}
  window.dispatchEvent(new CustomEvent("nm-section-update", { detail: { sectionId } }));
  window.dispatchEvent(new CustomEvent("nm-home-widgets-update", { detail: { sectionId } }));
  return true;
}

function removeDbFromHome(id) {
  if (!id) return;
  const changedSections = [];
  loadSections().forEach(sec => {
    const list = loadSectionWidgets(sec.id);
    const next = list.filter(w => w.dbId !== id);
    if (next.length !== list.length) {
      saveSectionWidgets(sec.id, next);
      changedSections.push(sec.id);
    }
  });
  try {
    const pins = new Set(JSON.parse(localStorage.getItem("nm-pinned-dbs") || "[]"));
    pins.delete(id);
    localStorage.setItem("nm-pinned-dbs", JSON.stringify([...pins]));
  } catch {}
  changedSections.forEach(sectionId => {
    window.dispatchEvent(new CustomEvent("nm-section-update", { detail: { sectionId } }));
  });
  window.dispatchEvent(new CustomEvent("nm-home-widgets-update"));
}

function loadWidgets() {
  try {
    const raw = localStorage.getItem("nm-home-widgets");
    if (raw) return JSON.parse(raw);
  } catch {}
  return defaultCoreWidgetsForConnection();
}
function saveWidgets(list) {
  localStorage.setItem("nm-home-widgets", JSON.stringify(list));
}

function HomeScreen({ go, goBack, dark, setDark }) {
  const [today, setToday] = uS1([]);
  const [widgets, setWidgets] = uS1(loadWidgets);
  const [recent, setRecent] = uS1(() => typeof window !== "undefined" ? window.nmLoadRecentPages?.(4) || [] : []);
  const [editMode, setEditMode] = uS1(false);
  const [draggedKey, setDraggedKey] = uS1(null);
  const [bentoDataCtx, setBentoDataCtx] = uS1({
    openTasks: 0, todayCount: 0, weekDone: 0, financeMonthTotal: 0, nextEvent: null, insightsCount: 0, worksActive: 0,
  });
  // If tasks API is already cached, skip the loading flash on re-entry
  const [loading, setLoading] = uS1(() =>
    typeof window !== "undefined" && window.__nmCache?.has(window.nmCoreEndpoint?.("tasks") || "/api/tasks") ? false : true
  );
  const [isMock, setIsMock] = uS1(false);
  const profileName = (typeof window !== "undefined" ? localStorage.getItem("nm-profile-name") : null) || "효율";
  const now = new Date();
  const weekdayKo = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][now.getDay()];
  const monthShort = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][now.getMonth()];
  const subtitle = `${weekdayKo} · ${monthShort} ${now.getDate()}`;
  const recentSub = (r) => {
    if (!r?.at) return r?.sub || "";
    const diff = Date.now() - Number(r.at);
    const min = Math.floor(diff / 60000);
    const hour = Math.floor(diff / 3600000);
    const day = Math.floor(diff / 86400000);
    const rel = min < 1 ? "방금" : min < 60 ? `${min}분 전` : hour < 24 ? `${hour}시간 전` : day === 1 ? "어제" : `${day}일 전`;
    return `${r.sub || "페이지"} · ${rel}`;
  };

  const fetchHomeData = React.useCallback(() => {
    function startOfDay(d) { const c = new Date(d); c.setHours(0,0,0,0); return c; }
    function fmtTime(iso) {
      if (!iso) return "";
      const d = new Date(iso);
      const h = d.getHours(), m = d.getMinutes();
      if (h === 0 && m === 0) return "종일";
      const per = h < 12 ? "AM" : "PM";
      const h12 = h % 12 === 0 ? 12 : h % 12;
      return `${h12}:${String(m).padStart(2, "0")} ${per}`;
    }
    function relLabel(iso) {
      if (!iso) return "";
      const now = new Date(), d = new Date(iso);
      const diff = Math.round((now - d) / 86400000);
      if (diff <= 0) return "오늘";
      if (diff === 1) return "어제";
      if (diff < 7) return `${diff}일 전`;
      return `${d.getMonth() + 1}/${d.getDate()}`;
    }
    function catToColor(cat) {
      const l = (cat || "").toLowerCase();
      if (l.includes("design") || l.includes("디자인")) return "blue";
      if (l.includes("dev") || l.includes("api") || l.includes("claude")) return "purple";
      if (l.includes("research") || l.includes("scrap")) return "green";
      if (l.includes("meeting") || l.includes("미팅")) return "brown";
      if (l.includes("copy") || l.includes("brand")) return "yellow";
      if (l.includes("urgent") || l.includes("release") || l.includes("긴급")) return "red";
      if (l.includes("marketing")) return "pink";
      if (l.includes("ai")) return "purple";
      return "gray";
    }
    function catToEmoji(cat) {
      const l = (cat || "").toLowerCase();
      if (l.includes("design")) return "🎨";
      if (l.includes("build") || l.includes("sprint")) return "🔨";
      if (l.includes("release") || l.includes("checklist")) return "📋";
      if (l.includes("research") || l.includes("scrap")) return "🔍";
      if (l.includes("ai") || l.includes("claude")) return "✳";
      if (l.includes("brand") || l.includes("marketing")) return "📢";
      return "📄";
    }

    const todayStart = startOfDay(new Date());
    let anyMock = false;

    Promise.all([
      window.nmFetch(window.nmCoreEndpoint?.("tasks") || "/api/tasks").then(j => j || { data: [], mock: false }),
      window.nmFetch(window.nmCoreEndpoint?.("insights") || "/api/insights").then(j => j || { data: [], mock: false }),
      window.nmFetch(window.nmCoreEndpoint?.("works") || "/api/works").then(j => j || { data: [], mock: false }),
      window.nmFetch(window.nmCoreEndpoint?.("finance") || "/api/finance").then(j => j || { data: [], mock: false }),
      window.nmFetch(window.nmCoreEndpoint?.("reflection") || "/api/reflection").then(j => j || { data: [], mock: false }),
    ]).then(([tasksRes, insightsRes, worksRes, financeRes, reflectionRes]) => {
      const tasks = tasksRes.data || [];
      const insights = insightsRes.data || [];
      const works = worksRes.data || [];
      const finance = financeRes.data || [];
      const reflection = reflectionRes.data || [];
      if (tasksRes.mock || insightsRes.mock || worksRes.mock || financeRes.mock || reflectionRes.mock) anyMock = true;

      // Today: tasks with dueDate today (always use real data — empty means empty)
      const todayItems = tasks
        .filter(t => t.dueDate && startOfDay(new Date(t.dueDate)).getTime() === todayStart.getTime())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 4)
        .map(t => ({ id: t.id, t: t.title, time: fmtTime(t.dueDate), c: catToColor(t.category) }));
      setToday(todayItems);

      // Today count for calendar DB card
      const todayCount = tasks.filter(t =>
        t.dueDate && startOfDay(new Date(t.dueDate)).getTime() === todayStart.getTime()
      ).length;
      const openCount = tasks.filter(t => !t.done).length;
      // Works: count all not-done items (some workspaces omit Status → mapStatus defaults to 'todo')
      const activeWorks = works.filter(w => w.status !== "done").length;

      // Update counts on existing widgets (don't overwrite user ordering)
      const countFor = (key) => {
        if (key === "tasks")      return `${openCount} open`;
        if (key === "calendar")   return `오늘 ${todayCount}`;
        if (key === "works")      return `${activeWorks} active`;
        if (key === "insights")   return `${insights.length} pages`;
        if (key === "finance")    return `${finance.length} 건`;
        if (key === "reflection") return `${reflection.length} 편`;
        return "";
      };
      setWidgets(curr => curr.map(w => ({ ...w, sub: w.core ? countFor(w.key) : (w.sub || "") })));

      // Publish core stats for DbSection widgets to consume (core metrics by key)
      const coreStats = {
        tasks:      `${openCount} open`,
        calendar:   `오늘 ${todayCount}`,
        works:      `${activeWorks} active`,
        insights:   `${insights.length} pages`,
        finance:    `${finance.length} 건`,
        reflection: `${reflection.length} 편`,
      };
      window.__nmCoreStats = coreStats;
      window.dispatchEvent(new CustomEvent("nm-core-stats", { detail: coreStats }));

      // Bento data
      const nextEv = tasks
        .filter(t => t.dueDate && !t.done && new Date(t.dueDate) >= new Date())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0] || null;
      const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
      const monthExpense = (finance || [])
        .filter(f => f.type === "expense" && f.date && new Date(f.date) >= monthStart)
        .reduce((s, f) => s + (f.amount || 0), 0);
      const weekDone = tasks.filter(t => t.done).length;
      setBentoDataCtx({
        openTasks: openCount,
        todayCount,
        weekDone,
        financeMonthTotal: monthExpense,
        nextEvent: nextEv,
        insightsCount: insights.length,
        worksActive: activeWorks,
      });

      // Recent fallback: Notion last-edited list. User-selected recents take priority.
      const combined = [
        ...insights.map(i => ({ id: i.id, n: i.title, cat: i.category || "인사이트", at: i.lastEditedAt })),
        ...works.map(w => ({ id: w.id, n: w.title, cat: w.category || "Works", at: null })),
      ];
      const recentItems = combined
        .sort((a, b) => (b.at ? new Date(b.at).getTime() : 0) - (a.at ? new Date(a.at).getTime() : 0))
        .slice(0, 4)
        .map(r => ({ id: r.id, n: r.n, sub: `${r.cat}${r.at ? " · " + relLabel(r.at) : ""}`, icon: catToEmoji(r.cat) }));
      const selectedRecent = window.nmLoadRecentPages?.(4) || [];
      setRecent(selectedRecent.length ? selectedRecent : recentItems);

      setIsMock(anyMock);
      setLoading(false);
    }).catch(() => {
      setToday([]);
      setRecent(window.nmLoadRecentPages?.(4) || []);
      setIsMock(false);
      setLoading(false);
    });
  }, []);

  uE1(() => {
    fetchHomeData();
    const interval = setInterval(fetchHomeData, 20000);
    const onVisibility = () => { if (!document.hidden) fetchHomeData(); };
    const onFocus = () => fetchHomeData();
    const onRecent = () => setRecent(window.nmLoadRecentPages?.(4) || []);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);
    window.addEventListener("nm-recent-update", onRecent);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("nm-recent-update", onRecent);
    };
  }, [fetchHomeData]);

  return (
    <>
      <NavBar title={`안녕하세요, ${profileName}`} subtitle={subtitle}
        right={<>
          <NavIconBtn icon="sync" onClick={() => window.location.reload()}/>
          <NavIconBtn icon={dark ? "sun" : "moon"} onClick={() => setDark && setDark(!dark)}/>
        </>}
      />
      <div style={{flex: 1, overflowY: "auto"}} className="hide-scroll scroll-fade">
        {/* search bar */}
        <div style={{padding: "0 16px 14px"}}>
          <div className="input" onClick={() => go("search")} style={{display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "12px 14px"}}>
            <Icon name="search" size={18} color="var(--n-text-muted)"/>
            <span className="t-body muted" style={{flex: 1}}>무엇이든 검색, 명령 실행</span>
            <span className="kbd">⌘K</span>
          </div>
        </div>

        {/* Sections (user-customizable DB rows) */}
        <SectionList go={go}/>

        {/* Today */}
        <div className="g-header" style={{marginTop: 18}}>오늘</div>
        <div className="g-list">
          {loading ? (
            <div className="g-row" style={{justifyContent: "center"}}>
              <span className="t-footnote muted">불러오는 중...</span>
            </div>
          ) : today.length === 0 ? (
            <div className="g-row" style={{justifyContent: "center"}}>
              <span className="t-footnote muted">오늘 일정이 없어요</span>
            </div>
          ) : today.map((e, i) => (
            <div key={i} className="g-row" style={{cursor: "pointer"}}>
              <button
                type="button"
                onClick={async (ev) => {
                  ev.stopPropagation();
                  // Optimistic: remove from today immediately
                  setToday(list => list.filter(x => x.id !== e.id));
                  try {
                    const taskUrl = window.nmCoreEndpoint?.("tasks") || "/api/tasks";
                    await fetch(taskUrl, {
                      method: "POST",
                      headers: {"Content-Type": "application/json"},
                      body: JSON.stringify({id: e.id, done: true, dbId: window.nmCoreDbId?.("tasks")}),
                    });
                    window.nmInvalidate && window.nmInvalidate("/api/tasks");
                    window.nmInvalidate && window.nmInvalidate(taskUrl);
                  } catch {}
                }}
                aria-label="완료"
                style={{
                  width: 20, height: 20, borderRadius: 4,
                  border: "1.5px solid var(--n-border-strong)",
                  background: "transparent",
                  display: "grid", placeItems: "center", flexShrink: 0,
                  cursor: "pointer", marginRight: 4,
                }}
              />
              <div style={{width: 3, alignSelf: "stretch", borderRadius: 2, background: `var(--n-tag-${e.c}-fg)`, margin: "2px 4px 2px 0"}}/>
              <div style={{flex: 1, minWidth: 0, cursor: "pointer"}} onClick={() => e.id ? go("page", {id: e.id}) : go("page")}>
                <div className="t-headline" style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{e.t}</div>
                <div className="t-footnote">{e.time}</div>
              </div>
              <div className="chev" onClick={() => e.id ? go("page", {id: e.id}) : go("page")}/>
            </div>
          ))}
        </div>

        {/* Recent */}
        <div className="g-header" style={{marginTop: 18}}>최근</div>
        <div className="g-list">
          {loading ? (
            <div className="g-row" style={{justifyContent: "center"}}>
              <span className="t-footnote muted">불러오는 중...</span>
            </div>
          ) : recent.length === 0 ? (
            <div className="g-row" style={{justifyContent: "center"}}>
              <span className="t-footnote muted">최근 페이지 없음</span>
            </div>
          ) : recent.map((r, i) => (
            <div key={i} className="g-row g-row--with-icon" onClick={() => r.id ? go("page", {id: r.id}) : go("page")} style={{cursor: "pointer"}}>
              <div className="icon-tile">{r.icon}</div>
              <div style={{flex: 1}}>
                <div className="t-body" style={{fontWeight: 500}}>{r.n}</div>
                <div className="t-footnote">{recentSub(r)}</div>
              </div>
              <div className="chev"/>
            </div>
          ))}
        </div>

        <TabSpacer/>
      </div>
      <TabBar active={0} onChange={i => {
        if (i === 1) go("search");
        else if (i === 2) go("event-edit");
        else if (i === 3) go("inbox");
        else if (i === 4) go("settings");
      }}/>
    </>
  );
}

function SearchScreen({ go, goBack }) {
  const scrollRef = React.useRef(null);
  const [q, setQ] = uS1(() => sessionStorage.getItem("nm-search-q") || "");
  const [results, setResults] = uS1(() => {
    try { return JSON.parse(sessionStorage.getItem("nm-search-results") || "[]"); } catch { return []; }
  });
  const [searching, setSearching] = uS1(false);

  // Restore scroll position after mount
  uE1(() => {
    const scroll = parseInt(sessionStorage.getItem("nm-search-scroll") || "0", 10);
    if (scrollRef.current && scroll) {
      requestAnimationFrame(() => { scrollRef.current.scrollTop = scroll; });
    }
  }, []);

  // Save results whenever they change
  uE1(() => {
    sessionStorage.setItem("nm-search-results", JSON.stringify(results));
  }, [results]);

  // Save query on every keystroke
  uE1(() => {
    sessionStorage.setItem("nm-search-q", q);
  }, [q]);

  const goToResult = (r) => {
    // Persist scroll before navigating
    if (scrollRef.current) {
      sessionStorage.setItem("nm-search-scroll", String(scrollRef.current.scrollTop));
    }
    go("page", {id: r.id});
  };
  const actions = [
    { t: "새 할 일 추가", k: "⌘N", action: () => go("event-edit") },
    { t: "일정 만들기",  k: "⌘⇧N", action: () => go("event-edit") },
    { t: "오늘 페이지 열기", k: "⌘T", action: () => go("home") },
  ];

  uE1(() => {
    if (!q.trim()) { setResults([]); return; }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then(r => r.ok ? r.json() : { results: [] })
        .then(j => { if (!cancelled) { setResults(j.results || j.data || []); setSearching(false); } })
        .catch(() => { if (!cancelled) { setResults([]); setSearching(false); } });
    }, 280);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [q]);
  return (
    <>
      <div style={{paddingTop: 54}}>
        <div style={{display: "flex", alignItems: "center", gap: 8, padding: "10px 16px"}}>
          <div className="input" style={{flex: 1, display: "flex", alignItems: "center", gap: 8}}>
            <Icon name="search" size={18} color="var(--n-text-muted)"/>
            <input autoFocus placeholder="무엇이든 검색, 명령 실행"
              value={q} onChange={e => setQ(e.target.value)}
              style={{border: "none", outline: "none", background: "transparent", flex: 1, font: "inherit", fontSize: "var(--fs-body)", color: "var(--n-text)"}}/>
          </div>
          <button className="btn btn--ghost" style={{padding: "6px 4px"}} onClick={() => { sessionStorage.removeItem("nm-search-q"); sessionStorage.removeItem("nm-search-results"); sessionStorage.removeItem("nm-search-scroll"); goBack ? goBack() : go("home"); }}>취소</button>
        </div>
      </div>
      <div ref={scrollRef} style={{flex: 1, overflowY: "auto"}}>
        {q.trim() ? (
          <>
            <div className="g-header">
              {searching ? "검색 중..." : `결과 · ${results.length}`}
            </div>
            <div className="g-list">
              {results.length === 0 && !searching && (
                <div className="g-row" style={{justifyContent: "center"}}>
                  <span className="t-footnote">일치하는 결과 없음</span>
                </div>
              )}
              {results.map((r, i) => (
                <div key={r.id || i} className="g-row g-row--with-icon" onClick={() => goToResult(r)} style={{cursor: "pointer"}}>
                  <div className="icon-tile">
                    <Icon name={r.type === "task" ? "check" : r.type === "insight" ? "sparkle" : "database"} size={15}/>
                  </div>
                  <div style={{flex: 1, minWidth: 0}}>
                    <div className="t-body" style={{fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{r.title}</div>
                    <div className="t-footnote">{r.type}</div>
                  </div>
                  <div className="chev"/>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="g-header">빠른 액션</div>
            <div className="g-list">
              {actions.map((a, i) => (
                <div key={i} className="g-row" onClick={a.action} style={{cursor: "pointer"}}>
                  <Icon name="plus" size={18} color="var(--n-text-muted)"/>
                  <div style={{flex: 1}} className="t-body">{a.t}</div>
                  <Icon name="chev-r" size={14} color="var(--n-text-faint)"/>
                </div>
              ))}
            </div>
          </>
        )}
        <TabSpacer/>
      </div>
    </>
  );
}


/* ── Inbox: 못한 일 중심 + 오늘 + 최근 스크랩 ──────────── */
function InboxScreen({ go }) {
  const [overdue, setOverdue] = uS1([]);
  const [todayList, setTodayList] = uS1([]);
  const [scraps, setScraps] = uS1([]);
  const [loading, setLoading] = uS1(true);

  const startOfDay = (d) => { const c = new Date(d); c.setHours(0,0,0,0); return c; };
  const nowDay = startOfDay(new Date());

  const loadData = React.useCallback(() => {
    const taskUrl = window.nmCoreEndpoint?.("tasks") || "/api/tasks";
    const hasCache = window.__nmCache?.has(taskUrl);
    if (!hasCache) setLoading(true);
    Promise.all([
      window.nmFetch(taskUrl).then(j => j || {data: []}),
      window.nmFetch(window.nmCoreEndpoint?.("insights") || "/api/insights").then(j => j || {data: []}),
    ]).then(([tasksRes, scrapRes]) => {
      const tasks = tasksRes.data || [];
      setOverdue(tasks.filter(t => !t.done && t.dueDate && startOfDay(new Date(t.dueDate)) < nowDay)
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
      setTodayList(tasks.filter(t => !t.done && t.dueDate && startOfDay(new Date(t.dueDate)).getTime() === nowDay.getTime())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)));
      setScraps((scrapRes.data || []).slice(0, 5));
      setLoading(false);
    });
  }, []);

  uE1(() => {
    loadData();
    const interval = setInterval(loadData, 20000);
    const onVis = () => { if (!document.hidden) loadData(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { clearInterval(interval); document.removeEventListener("visibilitychange", onVis); };
  }, [loadData]);

  const toggleDone = async (taskId, currentDone) => {
    setOverdue(list => list.filter(t => t.id !== taskId));
    setTodayList(list => list.filter(t => t.id !== taskId));
    try {
      const taskUrl = window.nmCoreEndpoint?.("tasks") || "/api/tasks";
      await fetch(taskUrl, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id: taskId, done: !currentDone, dbId: window.nmCoreDbId?.("tasks")}),
      });
      window.nmInvalidate && window.nmInvalidate("/api/tasks");
      window.nmInvalidate && window.nmInvalidate(taskUrl);
    } catch (e) {
      loadData();
    }
  };

  function daysOverdue(dueDate) {
    const d = startOfDay(new Date(dueDate));
    return Math.round((nowDay - d) / 86400000);
  }

  function TaskRow({ t, overdueLabel }) {
    return (
      <div className="g-row g-row--tap">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleDone(t.id, t.done); }}
          aria-label="완료"
          style={{
            width: 20, height: 20, borderRadius: 4,
            border: "1.5px solid var(--n-border-strong)",
            background: "transparent",
            display: "grid", placeItems: "center", flexShrink: 0,
            cursor: "pointer", marginRight: 6,
          }}
        />
        <div style={{flex: 1, minWidth: 0, cursor: "pointer"}} onClick={() => go("page", {id: t.id})}>
          <div className="t-headline" style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{t.title}</div>
          <div className="t-footnote" style={{display: "flex", gap: 6, alignItems: "center"}}>
            {overdueLabel && <><span style={{color: "var(--n-tag-red-fg)", fontWeight: 500}}>{overdueLabel}</span><span>·</span></>}
            {t.category && <span>{t.category}</span>}
          </div>
        </div>
      </div>
    );
  }

  const totalCount = overdue.length + todayList.length + scraps.length;

  return (
    <>
      <NavBar
        title="인박스"
        subtitle={loading ? "불러오는 중..." : `${totalCount}개 처리 대기`}
        right={<NavIconBtn icon="sync" onClick={loadData}/>}
      />
      <div style={{flex: 1, overflowY: "auto"}} className="hide-scroll scroll-fade">
        {loading ? (
          <div style={{padding: "40px 20px", textAlign: "center", color: "var(--n-text-muted)"}} className="t-footnote">불러오는 중...</div>
        ) : (
          <>
            <div className="g-header" style={{display: "flex", alignItems: "center", gap: 6}}>
              <span style={{color: "var(--n-tag-red-fg)"}}>● 못한 일</span>
              {overdue.length > 0 && <span style={{color: "var(--n-tag-red-fg)", fontWeight: 700}}>· {overdue.length}</span>}
            </div>
            <div className="g-list">
              {overdue.length === 0 ? (
                <div className="g-row" style={{justifyContent: "center"}}>
                  <span className="t-footnote muted">밀린 일 없음</span>
                </div>
              ) : (
                overdue.map(t => <TaskRow key={t.id} t={t} overdueLabel={`${daysOverdue(t.dueDate)}일 지남`}/>)
              )}
            </div>

            <div className="g-header" style={{marginTop: 18}}>오늘 · {todayList.length}</div>
            <div className="g-list">
              {todayList.length === 0 ? (
                <div className="g-row" style={{justifyContent: "center"}}>
                  <span className="t-footnote muted">오늘 할 일 없음</span>
                </div>
              ) : (
                todayList.map(t => <TaskRow key={t.id} t={t}/>)
              )}
            </div>

            {scraps.length > 0 && (
              <>
                <div className="g-header" style={{marginTop: 18}}>새로 도착 · {scraps.length}</div>
                <div className="g-list">
                  {scraps.map(s => (
                    <div key={s.id} className="g-row g-row--with-icon g-row--tap" onClick={() => go("page", {id: s.id})} style={{cursor: "pointer"}}>
                      <div className="icon-tile">📥</div>
                      <div style={{flex: 1, minWidth: 0}}>
                        <div className="t-body" style={{fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{s.title}</div>
                        <div className="t-footnote">{s.category || "Scrap"}</div>
                      </div>
                      <div className="chev"/>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
        <TabSpacer/>
      </div>
      <TabBar active={3} onChange={i => {
        if (i === 0) go("home");
        else if (i === 1) go("search");
        else if (i === 2) go("event-edit");
        else if (i === 4) go("settings");
      }}/>
    </>
  );
}



/* ── Bento widget section (2-col grid, edit/drag/+/×) ───── */
const BENTO_PRESETS = {
  "open-tasks":    { title: "열린 할 일",    render: (d) => ({ value: d.openTasks, suffix: "건" }) },
  "today-count":   { title: "오늘 이벤트",   render: (d) => ({ value: d.todayCount, suffix: "개" }) },
  "next-event":    { title: "다음 이벤트",   render: (d) => ({ value: d.nextEvent?.title?.slice(0, 20) || "없음", suffix: "" }) },
  "month-expense": { title: "이번 달 지출",  render: (d) => ({ value: d.financeMonthTotal ? `${Math.round(d.financeMonthTotal/10000)}만` : "0", suffix: "원" }) },
  "week-done":     { title: "이번 주 완료",  render: (d) => ({ value: d.weekDone, suffix: "개" }) },
  "insights":      { title: "인사이트",      render: (d) => ({ value: d.insightsCount, suffix: "개" }) },
  "works-active":  { title: "웍스 진행중",   render: (d) => ({ value: d.worksActive, suffix: "개" }) },
};

function loadBento() {
  try {
    const raw = localStorage.getItem("nm-bento-widgets");
    if (raw) return JSON.parse(raw);
  } catch {}
  return []; // default: empty — user adds DBs via "추가"
}
function saveBento(list) { localStorage.setItem("nm-bento-widgets", JSON.stringify(list)); }

function BentoSection({ go, dataCtx }) {
  const [items, setItems] = React.useState(loadBento);
  const [editMode, setEditMode] = React.useState(false);
  const [dragged, setDragged] = React.useState(null);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const remove = (idx) => {
    const next = items.filter((_, i) => i !== idx);
    setItems(next); saveBento(next);
  };
  const add = (db) => {
    // db is a Notion DB object from /api/databases
    const next = [...items, {
      type: "db-count",
      dbId: db.id,
      title: db.title,
      icon: db.icon || "📦",
      size: "S",
    }];
    setItems(next); saveBento(next); setPickerOpen(false);
  };
  const toggleSize = (idx) => {
    const next = items.map((it, i) => i === idx ? {...it, size: it.size === "S" ? "W" : "S"} : it);
    setItems(next); saveBento(next);
  };

  return (
    <>
      <div className="g-header" style={{marginTop: 18, display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: 16}}>
        <span>위젯</span>
        {editMode ? (
          <button onClick={() => setEditMode(false)} style={{border: "none", background: "transparent", color: "var(--n-accent)", fontWeight: 600, cursor: "pointer", fontSize: 13}}>완료</button>
        ) : (
          <button onClick={() => setEditMode(true)} style={{border: "none", background: "transparent", color: "var(--n-text-muted)", fontWeight: 500, cursor: "pointer", fontSize: 13}}>편집</button>
        )}
      </div>
      <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "10px 16px"}}>
        {items.map((it, i) => {
          let title = it.title;
          let val;
          if (it.type === "db-count") {
            title = it.title || "DB";
            val = { value: it.count ?? "·", suffix: "건" };
          } else {
            const preset = BENTO_PRESETS[it.type];
            if (!preset) return null;
            title = preset.title;
            val = preset.render(dataCtx || {});
          }
          const span = it.size === "W" ? "span 2" : "span 1";
          const isDragged = dragged === i;
          return (
            <div
              key={i}
              data-bento-idx={i}
              onPointerDown={(e) => {
                let startX = e.clientX, startY = e.clientY;
                let mode = editMode ? "drag" : "wait";
                let hoverIdx = i;
                if (mode === "drag") setDragged(i);
                const timer = mode === "wait" ? setTimeout(() => {
                  setEditMode(true);
                  setDragged(i);
                  mode = "drag";
                }, 500) : null;
                const cleanup = () => {
                  if (timer) clearTimeout(timer);
                  window.removeEventListener("pointermove", onMove);
                  window.removeEventListener("pointerup", onUp);
                };
                const onMove = (ev) => {
                  if (mode === "wait") {
                    const dx = ev.clientX - startX, dy = ev.clientY - startY;
                    if (dx*dx + dy*dy > 100) { mode = "cancel"; if (timer) clearTimeout(timer); }
                    return;
                  }
                  if (mode === "drag") {
                    const el = document.elementFromPoint(ev.clientX, ev.clientY);
                    const cell = el && el.closest("[data-bento-idx]");
                    if (cell) {
                      const idx = parseInt(cell.getAttribute("data-bento-idx"), 10);
                      if (!isNaN(idx) && idx !== hoverIdx) hoverIdx = idx;
                    }
                  }
                };
                const onUp = () => {
                  cleanup();
                  if (mode === "drag" && hoverIdx !== i) {
                    const next = [...items];
                    const [m] = next.splice(i, 1);
                    next.splice(hoverIdx, 0, m);
                    setItems(next); saveBento(next);
                  }
                  setDragged(null);
                };
                window.addEventListener("pointermove", onMove);
                window.addEventListener("pointerup", onUp);
              }}
              onContextMenu={(e) => { e.preventDefault(); setEditMode(true); }}
              onClick={() => {
                if (editMode) { toggleSize(i); return; }
                if (it.type === "db-count" && it.dbId) { go("db-list", {dbKey: null, dbId: it.dbId, subTitle: it.title}); }
              }}
              className={editMode ? "widget-wiggle" : ""}
              style={{
                gridColumn: span,
                background: "var(--n-surface)", borderRadius: 14,
                padding: 14, boxShadow: "var(--sh-1)",
                position: "relative", minHeight: 92,
                opacity: isDragged ? 0.4 : 1,
                cursor: editMode ? "move" : "default",
              }}
            >
              {editMode && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); remove(i); }}
                  aria-label="제거"
                  style={{
                    position: "absolute", top: -6, right: -6,
                    width: 22, height: 22, borderRadius: 11,
                    background: "var(--n-tag-red-fg)", color: "#fff",
                    border: "2px solid var(--n-bg-grouped)",
                    display: "grid", placeItems: "center", fontSize: 14, lineHeight: 1,
                    cursor: "pointer", padding: 0,
                  }}
                >×</button>
              )}
              <div className="t-caption" style={{overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                {it.icon && /^https?:\/\//.test(it.icon)
                  ? <img src={it.icon} style={{width: 12, height: 12, verticalAlign: "middle", marginRight: 4}}/>
                  : it.icon ? <span style={{fontSize: 12, marginRight: 4}}>{it.icon}</span> : null
                }
                {title}
              </div>
              <div style={{fontSize: 28, fontWeight: 700, letterSpacing: "-0.5px", marginTop: 6, color: "var(--n-text-strong)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                {val.value}<span style={{fontSize: 14, fontWeight: 500, color: "var(--n-text-muted)", marginLeft: 4}}>{val.suffix}</span>
              </div>
              {editMode && (
                <div className="t-footnote" style={{marginTop: 6, color: "var(--n-text-muted)"}}>
                  탭하여 {it.size === "S" ? "넓게" : "작게"} 변경
                </div>
              )}
            </div>
          );
        })}
        {/* + add */}
        <div
          onClick={() => setPickerOpen(true)}
          style={{
            gridColumn: "span 1",
            background: "transparent",
            border: "1.5px dashed var(--n-border-strong)",
            borderRadius: 14, padding: 14,
            cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            color: "var(--n-text-muted)", minHeight: 92,
          }}
        >
          <Icon name="plus" size={20} color="var(--n-text-muted)"/>
          <div className="t-footnote" style={{marginTop: 6}}>위젯 추가</div>
        </div>
      </div>

      {pickerOpen && <AddWidgetSheet onClose={() => setPickerOpen(false)} onAdd={add} go={go}/>}
    </>
  );
}


/* ── Widget add sheet (DB list) ─────────────── */
function AddWidgetSheet({ onClose, onAdd, go }) {
  const [dbList, setDbList] = React.useState(() => readDbListCache() || []);
  const [loading, setLoading] = React.useState(() => !(readDbListCache() || []).length);
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    let cancelled = false;
    loadDbList({ force: true })
      .then(list => {
        if (cancelled) return;
        setDbList(list);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const visible = query.trim()
    ? dbList.filter(d => d.title.toLowerCase().includes(query.toLowerCase()))
    : dbList;

  const sheet = (
    <>
      <div
        onClick={onClose}
        style={{position: "absolute", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 70}}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          background: "var(--n-bg-grouped)",
          borderRadius: "22px 22px 0 0",
          padding: "10px 16px 0",
          maxHeight: "calc(var(--nm-app-height, 100dvh) - var(--safe-t, 0px) - 24px)",
          display: "flex", flexDirection: "column",
          zIndex: 71,
          boxShadow: "0 -20px 40px rgba(0,0,0,0.15)",
          paddingBottom: "calc(22px + var(--safe-b, env(safe-area-inset-bottom, 0px)))",
        }}>
        <div style={{width: 36, height: 4, borderRadius: 2, background: "var(--n-border-strong)", margin: "0 auto 10px"}}/>
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10}}>
          <div className="t-title-3">DB 위젯 추가</div>
          <button onClick={onClose} style={{border: "none", background: "transparent", fontSize: 22, color: "var(--n-text-muted)", cursor: "pointer", padding: 4}}>×</button>
        </div>
        <div className="input" style={{display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", marginBottom: 10}}>
          <Icon name="search" size={16} color="var(--n-text-muted)"/>
          <input
            placeholder="DB 이름으로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--n-text)", fontFamily: "inherit"}}
          />
        </div>
        <div style={{overflowY: "auto", flex: 1}} className="hide-scroll">
          {loading ? (
            <div style={{display: "flex", flexDirection: "column", gap: 8}}>
              <div className="t-footnote muted" style={{textAlign: "center", padding: "16px 0 8px"}}>
                DB 목록 불러오는 중...
              </div>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{
                  height: 58, borderRadius: 12,
                  background: "linear-gradient(90deg, var(--n-surface) 0%, var(--n-surface-hover) 45%, var(--n-surface) 90%)",
                  backgroundSize: "220% 100%",
                  animation: "nm-shimmer 1.2s ease-in-out infinite",
                }}/>
              ))}
            </div>
          ) : visible.length === 0 ? (
            <div style={{padding: 30, textAlign: "center", color: "var(--n-text-muted)"}}>
              {query.trim() ? "일치 없음" : window.NM_EMPTY_DB_MESSAGE}
            </div>
          ) : (
            visible.map(d => (
              <div key={d.id}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px",
                  background: "var(--n-surface)", borderRadius: 12,
                  boxShadow: "var(--sh-1)", marginBottom: 6,
                }}>
                <div className="icon-tile icon-tile--lg" style={{background: "var(--n-surface-hover)", fontSize: 18, flexShrink: 0}}>
                  {d.icon && /^https?:\/\//.test(d.icon)
                    ? <img src={d.icon} alt="" style={{width: 22, height: 22, borderRadius: 4, objectFit: "cover"}}/>
                    : (d.icon || "📦")}
                </div>
                <div style={{flex: 1, minWidth: 0}}>
                  <div className="t-body" style={{fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{d.title}</div>
                  <div className="t-footnote muted" style={{marginTop: 3}}>
                    {(window.nmInferDbRoles?.(d) || []).slice(0, 2).map(roleLabel).join(" · ") || "원본 DB"}
                  </div>
                </div>
                <button
                  onClick={() => onAdd(d, "list")}
                  data-add-mode="auto"
                  style={{
                    border: "none",
                    background: "var(--n-surface-hover)",
                    color: "var(--n-text)",
                    padding: "6px 10px", borderRadius: 8,
                    fontSize: 12, fontWeight: 500,
                    cursor: "pointer", whiteSpace: "nowrap",
                  }}>추가</button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );

  const host = document.querySelector(".phone") || document.body;
  return ReactDOM.createPortal(sheet, host);
}


/* ── Section system: named rows of DB widgets ─────────── */
const DEFAULT_SECTIONS = [
  { id: "default", name: "데이터베이스" },
  { id: "widgets", name: "위젯" },
];

function loadSections() {
  try {
    const raw = localStorage.getItem("nm-sections");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {}
  return DEFAULT_SECTIONS;
}
function saveSections(list) { localStorage.setItem("nm-sections", JSON.stringify(list)); }
function normalizeSectionWidgets(list) {
  if (!Array.isArray(list)) return [];
  const seenDbIds = new Set();
  return list.reduce((acc, widget) => {
    if (!widget || typeof widget !== "object") return acc;
    const next = { ...widget };
    if (next.dbId && !next.core) {
      if (seenDbIds.has(next.dbId)) return acc;
      seenDbIds.add(next.dbId);
      next.key = `db-${next.dbId}`;
      next.dbKey = null;
      next.go = "db-list";
    }
    acc.push(next);
    return acc;
  }, []);
}
function loadSectionWidgets(id) {
  try {
    const raw = localStorage.getItem(`nm-section-${id}-widgets`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const normalized = normalizeSectionWidgets(parsed);
        return id === "default" ? ensureCalendarCoreWidget(normalized) : normalized;
      }
    }
  } catch {}
  if (id === "default") {
    try {
      const legacy = localStorage.getItem("nm-home-widgets");
      if (legacy) {
        const parsed = JSON.parse(legacy);
        if (Array.isArray(parsed)) {
          const migrated = ensureCalendarCoreWidget(normalizeSectionWidgets(parsed));
          saveSectionWidgets(id, migrated);
          return migrated;
        }
      }
    } catch {}
  }
  // First-load defaults are mode-aware: owner keeps curated cards, other users only see mapped DBs.
  if (id === "default") return defaultCoreWidgetsForConnection();
  return [];
}

// Ensure the "default" home section always contains a Calendar core widget when
// the user has a tasks DB mapped — calendar disappeared after drag/remove could
// leave the section without a calendar entry. Re-inject idempotently.
function ensureCalendarCoreWidget(list) {
  if (!Array.isArray(list)) return list;
  if (list.some(w => w && (w.key === "calendar" || w.go === "calendar"))) return list;
  const mode = (typeof window !== "undefined" && window.nmConnectionMode) ? window.nmConnectionMode() : "demo";
  if (mode !== "owner") return list;
  const calendarWidget = CORE_WIDGETS.find(w => w.key === "calendar");
  if (!calendarWidget) return list;
  // Insert just after tasks if present, otherwise at the start
  const tasksIdx = list.findIndex(w => w && (w.key === "tasks" || w.dbKey === "tasks"));
  const next = list.slice();
  const insertAt = tasksIdx >= 0 ? tasksIdx + 1 : 0;
  next.splice(insertAt, 0, { ...calendarWidget });
  try {
    localStorage.setItem("nm-section-default-widgets", JSON.stringify(next));
  } catch {}
  return next;
}
function saveSectionWidgets(id, list) {
  localStorage.setItem(`nm-section-${id}-widgets`, JSON.stringify(list));
}

function SectionList({ go }) {
  const [sections, setSections] = uS1(loadSections);
  const [editMode, setEditMode] = uS1(false);
  const [version, setVersion] = uS1(0);

  uE1(() => {
    const refresh = () => setVersion(v => v + 1);
    window.addEventListener("nm-section-update", refresh);
    window.addEventListener("nm-home-widgets-update", refresh);
    window.addEventListener("nm-connection-update", refresh);
    return () => {
      window.removeEventListener("nm-section-update", refresh);
      window.removeEventListener("nm-home-widgets-update", refresh);
      window.removeEventListener("nm-connection-update", refresh);
    };
  }, []);

  uE1(() => {
    let cancelled = false;
    hydrateMappedDbCardsToHome().then(changed => {
      if (!cancelled && changed) setVersion(v => v + 1);
    });
    return () => { cancelled = true; };
  }, []);

  const hasAnyWidgets = sections.some(sec => loadSectionWidgets(sec.id).length > 0);

  const renameSection = (id, name) => {
    const next = sections.map(s => s.id === id ? {...s, name: name.trim() || s.name} : s);
    setSections(next); saveSections(next);
  };
  const removeSection = (id) => {
    if (!confirm("이 섹션을 삭제하시겠어요? (안의 DB 위젯도 함께 지워집니다)")) return;
    const next = sections.filter(s => s.id !== id);
    setSections(next); saveSections(next);
    localStorage.removeItem(`nm-section-${id}-widgets`);
  };
  const addSection = () => {
    const id = `sec-${Date.now()}`;
    const next = [...sections, { id, name: "새 섹션" }];
    setSections(next); saveSections(next);
  };

  return (
    <>
      {hasAnyWidgets || editMode ? (
        sections.map(sec => (
          <DbSection
            key={`${sec.id}-${version}`}
            go={go}
            section={sec}
            isFirst={sec.id === sections[0].id}
            editMode={editMode}
            setEditMode={setEditMode}
            onRename={(name) => renameSection(sec.id, name)}
            onRemove={() => removeSection(sec.id)}
          />
        ))
      ) : (
        <>
          <div className="g-header" style={{paddingTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: 16}}>
            <span>데이터베이스</span>
            <button onClick={() => setEditMode(true)} aria-label="편집" style={{
              border: "none", background: "transparent", color: "var(--n-text-muted)",
              cursor: "pointer", width: 20, height: 20, borderRadius: 10,
              display: "grid", placeItems: "center", padding: 0,
            }}>
              <Icon name="pencil" size={12} color="var(--n-text-muted)" strokeWidth={1.8}/>
            </button>
          </div>
          <div style={{
            margin: "10px 16px 8px",
            padding: "28px 18px",
            borderRadius: "var(--r-lg)",
            background: "var(--n-surface)",
            color: "var(--n-text-muted)",
            textAlign: "center",
            boxShadow: "var(--sh-1)",
          }}>
            <div className="t-body" style={{fontWeight: 500}}>{window.NM_EMPTY_DB_MESSAGE}</div>
          </div>
        </>
      )}
      {editMode && (
        <div style={{padding: "4px 16px 0"}}>
          <button onClick={addSection} style={{
            width: "100%", padding: "10px 12px",
            border: "1.5px dashed var(--n-border-strong)",
            borderRadius: 12, background: "transparent",
            color: "var(--n-text-muted)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            fontSize: 13, fontWeight: 500,
          }}>
            <Icon name="plus" size={16} color="var(--n-text-muted)"/>
            섹션 추가
          </button>
        </div>
      )}
    </>
  );
}

function DbSection({ go, section, isFirst, editMode, setEditMode, onRename, onRemove }) {
  const [widgets, setWidgets] = React.useState(() => loadSectionWidgets(section.id));
  const [draggedKey, setDraggedKey] = React.useState(null);
  const [coreStats, setCoreStats] = React.useState(() => (typeof window !== "undefined" ? (window.__nmCoreStats || {}) : {}));
  const [customStats, setCustomStats] = React.useState({}); // { dbId: "N 개" }
  const containerRef = React.useRef(null);
  const prevRectsRef = React.useRef(new Map());

  // Subscribe to core stats updates from HomeScreen
  React.useEffect(() => {
    const handler = (e) => setCoreStats(e.detail || {});
    window.addEventListener("nm-core-stats", handler);
    if (window.__nmCoreStats) setCoreStats(window.__nmCoreStats);
    return () => window.removeEventListener("nm-core-stats", handler);
  }, []);

  // Fetch page counts for custom-DB widgets (dbId present, not core)
  React.useEffect(() => {
    const cache = (window.__nmCustomDbCountCache = window.__nmCustomDbCountCache || {});
    const customIds = widgets
      .filter(w => w.dbId && !w.core && !w.dbKey)
      .map(w => w.dbId);
    if (!customIds.length) return;

    let cancelled = false;
    const pending = customIds.filter(id => {
      const c = cache[id];
      return !c || (Date.now() - c.at) > 20000; // 20s cache window
    });
    // Hydrate from cache immediately
    const initial = {};
    customIds.forEach(id => { if (cache[id]) initial[id] = cache[id].label; });
    if (Object.keys(initial).length) setCustomStats(prev => ({ ...prev, ...initial }));

    if (!pending.length) return;
    Promise.all(pending.map(id =>
      window.nmFetch(`/api/database-pages?dbId=${encodeURIComponent(id)}`)
        .then(j => ({ id, count: Array.isArray(j?.data) ? j.data.length : 0 }))
        .catch(() => ({ id, count: null }))
    )).then(results => {
      if (cancelled) return;
      const patch = {};
      results.forEach(({ id, count }) => {
        if (count === null) return;
        const label = `${count} 개`;
        cache[id] = { at: Date.now(), label };
        patch[id] = label;
      });
      if (Object.keys(patch).length) setCustomStats(prev => ({ ...prev, ...patch }));
    });
    return () => { cancelled = true; };
  }, [widgets]);

  // Compute display subtitle for a widget
  const subFor = React.useCallback((w) => {
    // Core widgets — use key lookup
    if (w.core && coreStats[w.key]) return coreStats[w.key];
    // Widgets referencing a core dbKey (e.g. calendar aliased)
    if (w.dbKey && coreStats[w.dbKey]) return coreStats[w.dbKey];
    // Custom DB widgets
    if (w.dbId && customStats[w.dbId]) return customStats[w.dbId];
    return w.sub || "";
  }, [coreStats, customStats]);

  const saveW = (list) => {
    // Snapshot positions before layout change (FLIP: First)
    if (containerRef.current) {
      const map = new Map();
      containerRef.current.querySelectorAll("[data-widget-key]").forEach(c => {
        map.set(c.dataset.widgetKey, c.getBoundingClientRect());
      });
      prevRectsRef.current = map;
    }
    setWidgets(list);
    saveSectionWidgets(section.id, list);
  };

  // FLIP animation on widgets change
  React.useLayoutEffect(() => {
    const prev = prevRectsRef.current;
    if (prev.size === 0 || !containerRef.current) return;
    const cards = containerRef.current.querySelectorAll("[data-widget-key]");
    cards.forEach(c => {
      const oldRect = prev.get(c.dataset.widgetKey);
      if (!oldRect) return;
      const newRect = c.getBoundingClientRect();
      const dx = oldRect.left - newRect.left;
      const dy = oldRect.top - newRect.top;
      if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
        c.style.transform = `translate(${dx}px, ${dy}px)`;
        c.style.transition = "none";
        requestAnimationFrame(() => {
          c.style.transition = "transform 320ms cubic-bezier(0.22, 1, 0.36, 1)";
          c.style.transform = "";
        });
      }
    });
    prevRectsRef.current = new Map();
  }, [widgets]);

  // Listen for cross-section updates (when widget moved into this section from elsewhere)
  React.useEffect(() => {
    const handler = (e) => {
      if (e.detail && e.detail.sectionId === section.id) {
        // Snapshot before reload so FLIP works on incoming widget
        if (containerRef.current) {
          const map = new Map();
          containerRef.current.querySelectorAll("[data-widget-key]").forEach(c => {
            map.set(c.dataset.widgetKey, c.getBoundingClientRect());
          });
          prevRectsRef.current = map;
        }
        setWidgets(loadSectionWidgets(section.id));
      }
    };
    window.addEventListener("nm-section-update", handler);
    return () => window.removeEventListener("nm-section-update", handler);
  }, [section.id]);

  const addPickerOpen = React.useRef(false);
  const [pickerOpen, setPickerOpen] = React.useState(false);

  const addDb = (db, mode = "list") => {
    if (!db?.id) return;
    const isCal = mode === "calendar";
    const key = `db-${db.id}`;
    const col = isCal ? { c: "#DDEBF1", fg: "#337EA9" } : colorForDb(db.id);
    const roles = window.nmInferDbRoles?.(db) || [];
    const role = isCal ? "calendar" : (roles[0] || "database");
    const widget = {
      key, dbId: db.id, dbKey: null,
      role,
      n: db.title,
      c: col.c, fg: col.fg,
      icon: isCal ? "📅" : (db.icon || "📦"),
      sub: "",
      go: "db-list",
    };
    const existingIdx = widgets.findIndex(w => w.dbId === db.id || w.key === key || w.key === `cal-${db.id}`);
    const next = existingIdx >= 0
      ? widgets.map((w, idx) => idx === existingIdx ? { ...w, ...widget } : w)
      : [...widgets, widget];
    saveW(next);
    try {
      const pins = new Set(JSON.parse(localStorage.getItem("nm-pinned-dbs") || "[]"));
      pins.add(db.id);
      localStorage.setItem("nm-pinned-dbs", JSON.stringify([...pins]));
    } catch {}
    autoAssignDbRoles(db, true);
    window.dispatchEvent(new CustomEvent("nm-home-widgets-update", { detail: { sectionId: section.id } }));
    setPickerOpen(false);
  };

  return (
    <>
      <div className="g-header" style={{paddingTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between", paddingRight: 16}}>
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onRename(e.currentTarget.innerText)}
          style={{outline: "none", cursor: "text", minWidth: 40}}
        >{section.name}</span>
        <div style={{display: "flex", gap: 10, alignItems: "center"}}>
          {editMode && (
            <button onClick={onRemove} style={{border: "none", background: "transparent", color: "var(--n-tag-red-fg)", fontWeight: 500, cursor: "pointer", fontSize: 12}}>섹션 삭제</button>
          )}
          {isFirst && (editMode ? (
            <button onClick={() => setEditMode(false)} aria-label="완료" style={{
              border: "none", background: "var(--n-accent)", color: "var(--n-bg)",
              cursor: "pointer", width: 20, height: 20, borderRadius: 10,
              display: "grid", placeItems: "center", padding: 0,
            }}>
              <Icon name="check" size={11} color="var(--n-bg)" strokeWidth={2.2}/>
            </button>
          ) : (
            <button onClick={() => setEditMode(true)} aria-label="편집" style={{
              border: "none", background: "transparent", color: "var(--n-text-muted)",
              cursor: "pointer", width: 20, height: 20, borderRadius: 10,
              display: "grid", placeItems: "center", padding: 0,
            }}>
              <Icon name="pencil" size={12} color="var(--n-text-muted)" strokeWidth={1.8}/>
            </button>
          ))}
        </div>
      </div>
      <div ref={containerRef} data-section-id={section.id} style={{display: "flex", gap: 12, padding: "10px 16px 10px", overflowX: "auto", overflowY: "visible"}} className="hide-scroll">
        {widgets.map((d) => {
          const isDragged = draggedKey === d.key;
          return (
            <div
              key={d.key}
              data-widget-key={`${section.id}:${d.key}`}
              onPointerDown={(e) => {
                const pointerId = e.pointerId;
                const target = e.currentTarget;
                let startX = e.clientX, startY = e.clientY;
                let mode = editMode ? "drag" : "wait";
                let hoverKey = d.key;
                let offsetX = 0, offsetY = 0;

                const startDrag = () => {
                  setDraggedKey(d.key);
                  try { target.setPointerCapture(pointerId); } catch {}
                  target.style.touchAction = "none";
                  target.style.zIndex = "10";
                };
                if (mode === "drag") startDrag();

                const timer = mode === "wait" ? setTimeout(() => {
                  setEditMode(true);
                  mode = "drag";
                  startDrag();
                }, 500) : null;

                const cleanup = () => {
                  if (timer) clearTimeout(timer);
                  target.removeEventListener("pointermove", onMove);
                  target.removeEventListener("pointerup", onUp);
                  target.removeEventListener("pointercancel", onUp);
                  target.style.transform = "";
                  target.style.zIndex = "";
                  target.style.pointerEvents = "";
                };

                const onMove = (ev) => {
                  if (mode === "wait") {
                    const dx = ev.clientX - startX, dy = ev.clientY - startY;
                    if (dx*dx + dy*dy > 100) { mode = "cancel"; if (timer) clearTimeout(timer); }
                    return;
                  }
                  if (mode === "drag") {
                    offsetX = ev.clientX - startX;
                    offsetY = ev.clientY - startY;
                    target.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(1.04)`;
                    target.style.pointerEvents = "none";
                    const el = document.elementFromPoint(ev.clientX, ev.clientY);
                    target.style.pointerEvents = "";
                    if (!el) return;

                    const cell = el.closest("[data-widget-key]");
                    const sectionEl = el.closest("[data-section-id]");
                    const targetSectionId = sectionEl ? sectionEl.getAttribute("data-section-id") : null;

                    if (cell) {
                      const k = cell.getAttribute("data-widget-key");
                      const parts = k ? k.split(":") : [];
                      const hoverSectionId = parts[0];
                      const hoverWidgetKey = parts.slice(1).join(":");

                      if (hoverSectionId === section.id) {
                        // Same-section reorder
                        if (hoverWidgetKey && hoverWidgetKey !== hoverKey) {
                          hoverKey = hoverWidgetKey;
                          const next = [...widgets];
                          const from = next.findIndex(w => w.key === d.key);
                          const to = next.findIndex(w => w.key === hoverWidgetKey);
                          if (from >= 0 && to >= 0 && from !== to) {
                            const [m] = next.splice(from, 1);
                            next.splice(to, 0, m);
                            saveW(next);
                            target.style.transform = "translate(0, 0) scale(1.04)";
                            startX = ev.clientX;
                            startY = ev.clientY;
                          }
                        }
                      } else if (hoverSectionId && hoverSectionId !== section.id) {
                        // Cross-section: move widget from this section to target
                        const targetRaw = localStorage.getItem(`nm-section-${hoverSectionId}-widgets`);
                        let targetList = [];
                        try { targetList = targetRaw ? JSON.parse(targetRaw) : (hoverSectionId === "default" ? defaultCoreWidgetsForConnection() : []); } catch {}
                        // Avoid duplicate
                        if (targetList.find(w => w.key === d.key)) return;
                        const insertAt = targetList.findIndex(w => w.key === hoverWidgetKey);
                        const pos = insertAt >= 0 ? insertAt : targetList.length;
                        targetList.splice(pos, 0, widgets.find(w => w.key === d.key));
                        localStorage.setItem(`nm-section-${hoverSectionId}-widgets`, JSON.stringify(targetList));
                        // Remove from current
                        const remaining = widgets.filter(w => w.key !== d.key);
                        saveW(remaining);
                        window.dispatchEvent(new CustomEvent("nm-section-update", {detail: {sectionId: hoverSectionId}}));
                        // cleanup drag since widget no longer belongs to this section
                        cleanup();
                        setDraggedKey(null);
                      }
                    } else if (targetSectionId && targetSectionId !== section.id) {
                      // Hovering over empty area of another section — append
                      const targetRaw = localStorage.getItem(`nm-section-${targetSectionId}-widgets`);
                      let targetList = [];
                      try { targetList = targetRaw ? JSON.parse(targetRaw) : []; } catch {}
                      if (targetList.find(w => w.key === d.key)) return;
                      targetList.push(widgets.find(w => w.key === d.key));
                      localStorage.setItem(`nm-section-${targetSectionId}-widgets`, JSON.stringify(targetList));
                      const remaining = widgets.filter(w => w.key !== d.key);
                      saveW(remaining);
                      window.dispatchEvent(new CustomEvent("nm-section-update", {detail: {sectionId: targetSectionId}}));
                      cleanup();
                      setDraggedKey(null);
                    }
                  }
                };

                const onUp = () => {
                  cleanup();
                  setDraggedKey(null);
                };

                target.addEventListener("pointermove", onMove);
                target.addEventListener("pointerup", onUp);
                target.addEventListener("pointercancel", onUp);
              }}
              onContextMenu={(e) => { e.preventDefault(); setEditMode(true); }}
              onClick={() => {
                if (editMode) return;
                go(d.go || "db-list", { dbKey: d.dbId ? null : d.dbKey, dbId: d.dbId, dbRole: d.role || null, subTitle: d.dbId ? d.n : null, widgetKey: d.key });
              }}
              className={editMode ? "widget-wiggle" : ""}
              style={{
                flex: "0 0 134px", padding: 14,
                background: "var(--n-surface)", borderRadius: "var(--r-lg)",
                cursor: editMode ? "grab" : "pointer",
                boxShadow: isDragged ? "var(--sh-3)" : "var(--sh-1)",
                position: "relative",
                touchAction: editMode ? "none" : "auto",
                userSelect: "none",
                transition: "box-shadow var(--d-fast)",
              }}
            >
              {editMode && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const next = widgets.filter(w => w.key !== d.key);
                    saveW(next);
                    try {
                      const pins = new Set(JSON.parse(localStorage.getItem("nm-pinned-dbs") || "[]"));
                      if (d.dbId) pins.delete(d.dbId);
                      localStorage.setItem("nm-pinned-dbs", JSON.stringify([...pins]));
                    } catch {}
                    if (d.dbId) autoAssignDbRoles(d, false);
                  }}
                  aria-label="제거"
                  style={{
                    position: "absolute", top: -6, right: -6,
                    width: 22, height: 22, borderRadius: 11,
                    background: "var(--n-tag-red-fg)", color: "#fff",
                    border: "2px solid var(--n-bg-grouped)",
                    display: "grid", placeItems: "center", fontSize: 14, lineHeight: 1,
                    cursor: "pointer", padding: 0,
                  }}
                >×</button>
              )}
              <div className="icon-tile icon-tile--lg" style={{background: d.c, color: d.fg, marginBottom: 28, fontSize: 18}}>
                {d.icon && /^https?:\/\//.test(d.icon)
                  ? <img src={d.icon} alt="" style={{width: 22, height: 22, borderRadius: 4, objectFit: "cover"}}/>
                  : d.icon}
              </div>
              <div
                className="t-headline"
                title={d.n}
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  wordBreak: "keep-all",
                  overflowWrap: "normal",
                  fontSize: 15,
                  lineHeight: "20px",
                }}
              >{d.n}</div>
              <div className="t-footnote" style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis"}}>{subFor(d)}</div>
            </div>
          );
        })}
        {/* + card — only in edit mode */}
        {editMode && (
          <div
            onClick={() => setPickerOpen(true)}
            style={{
              flex: "0 0 134px", padding: 14,
              background: "transparent",
              border: "1.5px dashed var(--n-border-strong)",
              borderRadius: "var(--r-lg)",
              cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              color: "var(--n-text-muted)",
              minHeight: 134,
            }}
          >
            <Icon name="plus" size={22} color="var(--n-text-muted)"/>
            <div className="t-footnote" style={{marginTop: 6}}>DB 추가</div>
          </div>
        )}
        <div style={{flex: "0 0 4px"}}/>
      </div>
      {pickerOpen && <AddWidgetSheet onClose={() => setPickerOpen(false)} onAdd={addDb} go={go}/>}
    </>
  );
}

Object.assign(window, { OnboardingScreen, BentoSection, AddWidgetSheet, SectionList, DbSection, TokenScreen, DbPickerScreen, HomeScreen, SearchScreen, InboxScreen, defaultCoreWidgetsForConnection });
