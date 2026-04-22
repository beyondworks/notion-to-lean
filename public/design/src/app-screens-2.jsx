/* Database screens: list (card), board (kanban), calendar, table-fluid */
const { useState: uS2 } = React;

const TASKS = [
  { id: 1, t: "디자인 시스템 문서 정리", status: "진행중", prio: "높음", due: "오늘", tags: ["design"], assignees: ["H","K"], color: "blue" },
  { id: 2, t: "API 연동 스펙 확정",      status: "진행중", prio: "높음", due: "내일", tags: ["dev","api"], assignees: ["H","J","M"], color: "purple" },
  { id: 3, t: "홈 화면 유저 테스트",      status: "검토",   prio: "중간", due: "Fri",  tags: ["research"], assignees: ["K"], color: "green" },
  { id: 4, t: "릴리스 노트 초안",         status: "시작 전",prio: "낮음", due: "다음주",tags: ["docs"], assignees: ["J"], color: "gray" },
  { id: 5, t: "온보딩 카피 리뷰",         status: "시작 전",prio: "중간", due: "다음주",tags: ["copy"], assignees: ["M"], color: "yellow" },
  { id: 6, t: "Q2 OKR 검토 미팅",         status: "완료",   prio: "중간", due: "어제",  tags: ["meeting"], assignees: ["H","K","J"], color: "brown" },
];
const prioColor = { "높음": "red", "중간": "orange", "낮음": "gray" };
const statusColor = { "시작 전": "gray", "진행중": "blue", "검토": "yellow", "완료": "green" };

function Assignees({ names, size = 22 }) {
  return (
    <div style={{display: "flex"}}>
      {names.slice(0,3).map((n, i) => (
        <div key={i} style={{marginLeft: i === 0 ? 0 : -7}}>
          <Avatar name={n} size={size}/>
        </div>
      ))}
      {names.length > 3 && <div className="avatar" style={{width: size, height: size, marginLeft: -7, fontSize: 10}}>+{names.length - 3}</div>}
    </div>
  );
}

function ViewSwitcher({ view, setView }) {
  const views = [
    { k: "list", icon: "list", label: "리스트" },
    { k: "board", icon: "grid", label: "보드" },
    { k: "cal", icon: "calendar", label: "캘린더" },
    { k: "table", icon: "database", label: "테이블" },
  ];
  return (
    <div style={{display: "flex", gap: 6, overflowX: "auto", padding: "6px 16px 10px"}} className="hide-scroll">
      {views.map(v => (
        <button key={v.k} onClick={() => setView(v.k)} style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "7px 12px",
          borderRadius: 16,
          border: "none",
          background: view === v.k ? "var(--n-accent)" : "var(--n-surface)",
          color: view === v.k ? "var(--n-bg)" : "var(--n-text)",
          fontSize: 14, fontWeight: 500,
          cursor: "pointer",
          whiteSpace: "nowrap",
          boxShadow: view === v.k ? "none" : "var(--sh-1)",
        }}>
          <Icon name={v.icon} size={15}/>
          {v.label}
        </button>
      ))}
    </div>
  );
}

function TaskCard({ t, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "var(--n-surface)", borderRadius: 14, padding: "12px 14px",
      marginBottom: 8, boxShadow: "var(--sh-1)", cursor: "pointer",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{display: "flex", alignItems: "flex-start", gap: 10}}>
        <div style={{width: 4, alignSelf: "stretch", borderRadius: 2, background: `var(--n-tag-${t.color}-fg)`, flexShrink: 0}}/>
        <div style={{flex: 1, minWidth: 0}}>
          <div className="t-body" style={{fontWeight: 500, marginBottom: 4, color: "var(--n-text-strong)"}}>{t.t}</div>
          <div style={{display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center"}}>
            <span className={`tag tag-${statusColor[t.status]}`}>{t.status}</span>
            <span className={`tag tag-${prioColor[t.prio]}`}>● {t.prio}</span>
            {t.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
          </div>
        </div>
      </div>
      <div style={{display: "flex", alignItems: "center", gap: 10, paddingLeft: 14}}>
        <div style={{display: "flex", alignItems: "center", gap: 4, color: "var(--n-text-muted)", fontSize: 13}}>
          <Icon name="clock" size={13}/>{t.due}
        </div>
        <div style={{flex: 1}}/>
        <Assignees names={t.assignees} size={22}/>
      </div>
    </div>
  );
}

function formatCreatedAt(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.round((now - d) / 86400000);
  if (diff === 0) return "오늘";
  if (diff === 1) return "어제";
  if (diff < 7) return `${diff}일 전`;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function mapNotionTaskToCard(t) {
  const dueDate = t.dueDate ? new Date(t.dueDate) : null;
  const today = new Date(); today.setHours(0,0,0,0);
  let dueLabel = "";
  if (dueDate) {
    const d = new Date(dueDate); d.setHours(0,0,0,0);
    const diff = Math.round((d - today) / 86400000);
    if (diff === 0) dueLabel = "오늘";
    else if (diff === 1) dueLabel = "내일";
    else if (diff === -1) dueLabel = "어제";
    else if (diff > 1 && diff < 7) dueLabel = `${diff}일 후`;
    else if (diff < -1) dueLabel = `${Math.abs(diff)}일 전`;
    else dueLabel = `${d.getMonth() + 1}/${d.getDate()}`;
  }
  const statusLabel = t.done ? "완료" : "진행중";
  const catLower = (t.category || "").toLowerCase();
  let color = "gray";
  if (catLower.includes("design")) color = "blue";
  else if (catLower.includes("dev") || catLower.includes("api")) color = "purple";
  else if (catLower.includes("research")) color = "green";
  else if (catLower.includes("meeting")) color = "brown";
  else if (catLower.includes("urgent") || catLower.includes("release")) color = "red";
  else if (catLower.includes("copy") || catLower.includes("brand")) color = "yellow";
  return {
    id: t.id,
    t: t.title,
    status: statusLabel,
    prio: "중간",
    due: dueLabel,
    tags: t.category ? [t.category] : [],
    assignees: ["H"],
    color,
    _raw: t,
  };
}

const DB_CONFIG = {
  tasks:      { endpoint: "tasks",      title: "태스크" },
  works:      { endpoint: "works",      title: "웍스" },
  insights:   { endpoint: "insights",   title: "인사이트" },
  finance:    { endpoint: "finance",    title: "가계부" },
  reflection: { endpoint: "reflection", title: "스크립트" },
};

// Insights sub-category name → sub-DB id
const INSIGHTS_SUB_DB = {
  "AI":               "241003c7-f7be-800f-8f07-f95918c3a072",
  "Claude Code":      "2fd003c7-f7be-80cb-90d3-dbecc15c507f",
  "Scrap":            "247003c7-f7be-80c0-a9f4-cddbcd337415",
  "Slack to Notion":  "247003c7-f7be-80c0-a9f4-cddbcd337415",
  "Design":           "241003c7-f7be-804f-a021-fc24777ca9ad",
  "Branding":         "247003c7-f7be-803a-83f5-fd9494d24d62",
  "Build":            "247003c7-f7be-8074-a583-e1638fd3cfed",
  "Marketing":        "247003c7-f7be-8035-83f4-d39480d66503",
};

function DbListScreen({ go, goBack, ctx }) {
  const dbKey = ctx?.dbKey;
  const hasCustomDb = !!ctx?.dbId && !dbKey;
  const cfg = hasCustomDb
    ? { endpoint: `insights?dbId=${ctx.dbId}`, title: ctx.subTitle || "데이터베이스" }
    : (DB_CONFIG[dbKey || "tasks"] || DB_CONFIG.tasks);
  const isTasks = dbKey === "tasks";

  const [view, setView] = uS2("list");
  const [tasks, setTasks] = uS2([]);
  const [items, setItems] = uS2([]);
  const [loading, setLoading] = uS2(true);
  const [filter, setFilter] = uS2("today"); // today | tomorrow | overdue
  const [query, setQuery] = uS2("");
  const [createOpen, setCreateOpen] = uS2(false);

  const toggleTaskDone = async (taskId, currentDone) => {
    setTasks(tasks.map(t => t.id === taskId ? {...t, status: currentDone ? "진행중" : "완료", _raw: {...t._raw, done: !currentDone}} : t));
    try {
      await fetch("/api/tasks", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id: taskId, done: !currentDone}),
      });
    } catch (e) {
      setTasks(tasks);
    }
  };

  // Filter buckets based on raw dueDate (ISO)
  function dueDateOf(t) { return t._raw?.dueDate ? new Date(t._raw.dueDate) : null; }
  function sameDay(a, b) {
    if (!a || !b) return false;
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }
  const nowDay = new Date(); nowDay.setHours(0,0,0,0);
  const tomDay = new Date(nowDay); tomDay.setDate(tomDay.getDate() + 1);

  const filteredTasks = tasks.filter(t => {
    const isDone = t._raw?.done || t.status === "완료";
    const dd = dueDateOf(t);
    if (filter === "today") return !isDone && dd && sameDay(dd, nowDay);
    if (filter === "tomorrow") return !isDone && dd && sameDay(dd, tomDay);
    if (filter === "overdue") return !isDone && dd && dd < nowDay;
    return true;
  });

  // Group filtered tasks by category
  const grouped = filteredTasks.reduce((acc, t) => {
    const cat = (t._raw?.category) || "기타";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  const subDbId = ctx?.dbId || null;
  const subTitle = ctx?.subTitle || null;

  const fetchDbData = React.useCallback((showLoader = true) => {
    if (showLoader) setLoading(true);
    let url = `/api/${cfg.endpoint}`;
    if (subDbId && !cfg.endpoint.includes("?")) url = `/api/${cfg.endpoint}?dbId=${subDbId}`;
    fetch(url)
      .then(r => r.ok ? r.json() : { data: [] })
      .then(j => {
        const raw = j.data || [];
        if (isTasks) setTasks(raw.map(mapNotionTaskToCard));
        else setItems(raw);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [cfg.endpoint, subDbId, isTasks]);
  React.useEffect(() => {
    fetchDbData(true);
    const interval = setInterval(() => fetchDbData(false), 20000);
    const onVis = () => { if (!document.hidden) fetchDbData(false); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", () => fetchDbData(false));
    return () => { clearInterval(interval); document.removeEventListener("visibilitychange", onVis); };
  }, [fetchDbData]);

  const bucket = (which) => {
    if (which === "today") return tasks.filter(t => t.due === "오늘" || t.due === "어제");
    if (which === "week") return tasks.filter(t => ["내일", "2일 후", "3일 후", "4일 후", "5일 후", "6일 후"].includes(t.due));
    if (which === "later") return tasks.filter(t => !["오늘", "어제", "내일", "2일 후", "3일 후", "4일 후", "5일 후", "6일 후"].includes(t.due));
    return [];
  };

  const openCount = tasks.filter(t => t.status !== "완료").length;
  const subtitle = loading
    ? "불러오는 중..."
    : isTasks
      ? `${openCount} open · ${tasks.length} total`
      : `${items.length}개`;

  // Alias support — user can rename DB display title; stored per dbId/dbKey
  const aliasKey = hasCustomDb ? `nm-db-alias-${ctx?.dbId}` : (ctx?.widgetKey ? `nm-db-alias-w-${ctx.widgetKey}` : (dbKey ? `nm-db-alias-${dbKey}` : null));
  const baseTitle = (hasCustomDb) ? cfg.title : (subDbId && subTitle ? `${cfg.title} · ${subTitle}` : cfg.title);
  const [titleAlias, setTitleAlias] = uS2(() => aliasKey ? (localStorage.getItem(aliasKey) || "") : "");
  const effectiveTitle = titleAlias || baseTitle;
  const editableTitle = (
    <span
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        const v = e.currentTarget.innerText.trim();
        if (!aliasKey) return;
        const newName = (!v || v === baseTitle) ? "" : v;
        if (newName) {
          localStorage.setItem(aliasKey, newName);
          setTitleAlias(newName);
        } else {
          localStorage.removeItem(aliasKey);
          setTitleAlias("");
        }
        // Propagate the new name to any home widgets referencing this dbKey/dbId
        try {
          const CORE_NAMES = { tasks:"태스크", calendar:"캘린더", works:"웍스", insights:"인사이트", finance:"가계부", reflection:"스크립트" };
          const CORE_WIDGETS_FALLBACK = [
            { key: "tasks", dbKey: "tasks", n: "태스크", c: "#DDEDEA", fg: "#448361", icon: "✓", go: "db-list", core: true },
            { key: "calendar", dbKey: "tasks", n: "캘린더", c: "#DDEBF1", fg: "#337EA9", icon: "📅", go: "calendar", core: true },
            { key: "works", dbKey: "works", n: "웍스", c: "#EAE4F2", fg: "#9065B0", icon: "◆", go: "db-list", core: true },
            { key: "insights", dbKey: "insights", n: "인사이트", c: "#FBF3DB", fg: "#CB912F", icon: "✎", go: "db-list", core: true },
            { key: "finance", dbKey: "finance", n: "가계부", c: "#FDEBEC", fg: "#D44C47", icon: "₩", go: "db-list", core: true },
            { key: "reflection", dbKey: "reflection", n: "스크립트", c: "#F4EEEE", fg: "#9F6B53", icon: "✐", go: "db-list", core: true },
          ];
          const sectionsRaw = localStorage.getItem("nm-sections");
          const sections = sectionsRaw ? JSON.parse(sectionsRaw) : [{id:"default", name:"데이터베이스"},{id:"widgets", name:"위젯"}];
          sections.forEach(sec => {
            const key = `nm-section-${sec.id}-widgets`;
            let list;
            try { list = JSON.parse(localStorage.getItem(key) || "null"); } catch { list = null; }
            if (!Array.isArray(list)) {
              // First-time: use default CORE for "default" section, empty otherwise
              list = sec.id === "default" ? CORE_WIDGETS_FALLBACK : [];
            }
            let changed = false;
            const next = list.map(w => {
              const matches =
                (ctx?.dbId && w.dbId === ctx.dbId) ||
                (ctx?.widgetKey && w.key === ctx.widgetKey) ||
                (!ctx?.dbId && !ctx?.widgetKey && dbKey && w.dbKey === dbKey && w.key === dbKey);
              if (matches) {
                changed = true;
                const resetName = !newName
                  ? (CORE_NAMES[w.key] || w.n)
                  : newName;
                return { ...w, n: resetName };
              }
              return w;
            });
            if (changed) {
              localStorage.setItem(key, JSON.stringify(next));
              window.dispatchEvent(new CustomEvent("nm-section-update", {detail: {sectionId: sec.id}}));
            }
          });
        } catch {}
      }}
      style={{outline: "none", cursor: "text", padding: "0 2px", borderRadius: 4}}
    >{effectiveTitle}</span>
  );
  const handleBack = () => {
    if (hasCustomDb) {
      goBack ? goBack() : go("home");
      return;
    }
    if (subDbId) {
      go("db-list", {dbKey});
    } else {
      go("home");
    }
  };

  return (
    <>
      <NavBar title={editableTitle} subtitle={subtitle}
        left={<NavIconBtn icon="back" onClick={handleBack}/>}
        right={<><NavIconBtn icon="filter"/><NavIconBtn icon="more"/></>}
      />
      {isTasks && <ViewSwitcher view={view} setView={setView}/>}
      <div style={{flex: 1, overflowY: "auto", padding: "2px 16px 0"}} className="scroll-fade">
        {!isTasks && dbKey !== "finance" && (
          <div style={{paddingTop: 12}}>
            {/* Search filter (기본) */}
            <div style={{marginBottom: 10, position: "relative"}}>
              <div className="input" style={{display: "flex", alignItems: "center", gap: 8, padding: "10px 12px"}}>
                <Icon name="search" size={16} color="var(--n-text-muted)"/>
                <input
                  placeholder="제목으로 검색"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--n-text)", fontFamily: "inherit"}}
                />
                {query && <button onClick={() => setQuery("")} style={{border: "none", background: "transparent", cursor: "pointer", color: "var(--n-text-muted)", padding: 0}}><Icon name="close" size={14}/></button>}
              </div>
            </div>

            {(() => {
              const visible = query.trim()
                ? items.filter((i) => (i.title || i.client || "").toLowerCase().includes(query.toLowerCase()))
                : items;
              if (visible.length === 0 && !loading) {
                return <div style={{textAlign: "center", padding: "40px 20px", color: "var(--n-text-muted)"}} className="t-footnote">{query ? "일치 항목 없음" : "항목이 없어요"}</div>;
              }
              return visible.map((it) => {
                const itemTitle = it.title || it.client || "(제목 없음)";
                const subDbMatch = dbKey === "insights" && !subDbId ? INSIGHTS_SUB_DB[itemTitle] : null;
                const handleClick = subDbMatch
                  ? () => go("db-list", {dbKey: "insights", dbId: subDbMatch, subTitle: itemTitle})
                  : () => go("page", {id: it.id});
                const dateStr = formatCreatedAt(it.createdAt);
                return (
                  <div key={it.id}
                    onClick={handleClick}
                    style={{
                      background: "var(--n-surface)", borderRadius: 14,
                      padding: "12px 14px", marginBottom: 8,
                      boxShadow: "var(--sh-1)", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                    <div style={{flex: 1, minWidth: 0}}>
                      <div className="t-body" style={{fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{itemTitle}</div>
                      <div className="t-footnote" style={{marginTop: 2, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center"}}>
                        {it.category && <span>{it.category}</span>}
                        {it.category && dateStr && <span style={{color: "var(--n-text-faint)"}}>·</span>}
                        {dateStr && <span>{dateStr}</span>}
                      </div>
                    </div>
                    <div className="chev"/>
                  </div>
                );
              });
            })()}
          </div>
        )}

        {/* Finance: 지출 / 수입 그룹 분리 */}
        {dbKey === "finance" && (
          <FinanceView go={go} items={items} loading={loading}/>
        )}
        {isTasks && view === "list" && (
          <>
            {/* Filter pills: 오늘 / 내일 / 못한 일 */}
            <div style={{display: "flex", gap: 6, padding: "6px 2px 12px", overflowX: "auto"}} className="hide-scroll">
              {[
                {k: "today",    label: "오늘 할 일",  count: tasks.filter(t => !((t._raw?.done) || t.status==="완료") && dueDateOf(t) && sameDay(dueDateOf(t), nowDay)).length},
                {k: "tomorrow", label: "내일 할 일",  count: tasks.filter(t => !((t._raw?.done) || t.status==="완료") && dueDateOf(t) && sameDay(dueDateOf(t), tomDay)).length},
                {k: "overdue",  label: "못한 일",    count: tasks.filter(t => !((t._raw?.done) || t.status==="완료") && dueDateOf(t) && dueDateOf(t) < nowDay).length},
              ].map(f => {
                const on = filter === f.k;
                return (
                  <button key={f.k} onClick={() => setFilter(f.k)} style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 12px", borderRadius: 16, border: "none",
                    background: on ? "var(--n-accent)" : "var(--n-surface)",
                    color: on ? "var(--n-bg)" : "var(--n-text)",
                    fontSize: 14, fontWeight: 500,
                    cursor: "pointer", whiteSpace: "nowrap",
                    boxShadow: on ? "none" : "var(--sh-1)",
                  }}>
                    {f.label}
                    <span style={{
                      minWidth: 18, padding: "0 5px",
                      borderRadius: 9,
                      background: on ? "var(--n-bg)" : "var(--n-surface-hover)",
                      color: on ? "var(--n-accent)" : "var(--n-text-muted)",
                      fontSize: 11, fontWeight: 600,
                    }}>{f.count}</span>
                  </button>
                );
              })}
            </div>

            {filteredTasks.length === 0 ? (
              <div style={{textAlign: "center", padding: "40px 20px", color: "var(--n-text-muted)"}} className="t-footnote">
                {filter === "today" ? "오늘 할 일이 없어요" : filter === "tomorrow" ? "내일 할 일이 없어요" : "못한 일이 없어요"}
              </div>
            ) : (
              // 분류별 프리뷰
              Object.entries(grouped).map(([cat, list]) => (
                <div key={cat} style={{marginBottom: 12}}>
                  <div className="t-caption" style={{padding: "4px 2px 8px"}}>{cat} · {list.length}</div>
                  {list.map(t => (
                    <div key={t.id} style={{
                      display: "flex", alignItems: "flex-start", gap: 10,
                      background: "var(--n-surface)", borderRadius: 14,
                      padding: "12px 14px", marginBottom: 8,
                      boxShadow: "var(--sh-1)",
                    }}>
                      <button
                        type="button"
                        onClick={(ev2) => { ev2.stopPropagation(); toggleTaskDone(t.id, !!t._raw?.done); }}
                        aria-label={t._raw?.done ? "완료 취소" : "완료"}
                        style={{
                          width: 20, height: 20, borderRadius: 4, marginTop: 2,
                          border: t._raw?.done ? "none" : "1.5px solid var(--n-border-strong)",
                          background: t._raw?.done ? "var(--n-accent)" : "transparent",
                          display: "grid", placeItems: "center",
                          cursor: "pointer", flexShrink: 0,
                        }}
                      >{t._raw?.done && <Icon name="check" size={12} color="var(--n-bg)"/>}</button>
                      <div style={{flex: 1, minWidth: 0, cursor: "pointer"}} onClick={() => go("page", {id: t.id})}>
                        <div className="t-body" style={{
                          fontWeight: 500,
                          color: t._raw?.done ? "var(--n-text-muted)" : "var(--n-text-strong)",
                          textDecoration: t._raw?.done ? "line-through" : "none",
                        }}>{t.t}</div>
                        {t.due && <div className="t-footnote" style={{marginTop: 2, display: "flex", alignItems: "center", gap: 4}}><Icon name="clock" size={12}/>{t.due}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </>
        )}

        {isTasks && view === "board" && (
          <div style={{display: "flex", gap: 12, overflowX: "auto", paddingBottom: 10}} className="hide-scroll">
            {["진행중", "검토", "시작 전", "완료"].map(st => {
              const items = tasks.filter(t => t.status === st);
              return (
                <div key={st} style={{flex: "0 0 260px", background: "var(--n-bg-grouped)", borderRadius: 14, padding: 10}}>
                  <div style={{display: "flex", alignItems: "center", gap: 6, padding: "2px 4px 10px"}}>
                    <span className={`tag tag-${statusColor[st]}`}>{st}</span>
                    <span className="t-footnote">{items.length}</span>
                  </div>
                  {items.map(t => <TaskCard key={t.id} t={t} onClick={() => go("page", {id: t.id})}/>)}
                  <button className="btn btn--ghost btn--sm" style={{width: "100%", justifyContent: "flex-start", padding: "8px 8px"}} onClick={() => go("event-edit")}>
                    <Icon name="plus" size={14}/>추가
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {isTasks && view === "table" && (
          <div style={{background: "var(--n-surface)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--sh-1)"}}>
            <div style={{overflowX: "auto"}} className="hide-scroll">
              <table style={{borderCollapse: "collapse", fontSize: 14, minWidth: 540}}>
                <thead>
                  <tr style={{background: "var(--n-surface-hover)"}}>
                    {["제목", "상태", "우선순위", "담당", "마감"].map((h,i) => (
                      <th key={h} style={{textAlign: "left", padding: "10px 14px", fontWeight: 500, color: "var(--n-text-muted)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em", position: i === 0 ? "sticky" : "static", left: i === 0 ? 0 : "auto", background: "var(--n-surface-hover)", minWidth: i === 0 ? 160 : 90}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.map(t => (
                    <tr key={t.id} onClick={() => go("page", {id: t.id})} style={{borderTop: "0.5px solid var(--n-border)", cursor: "pointer"}}>
                      <td style={{padding: "12px 14px", fontWeight: 500, position: "sticky", left: 0, background: "var(--n-surface)", minWidth: 160}}>{t.t}</td>
                      <td style={{padding: "12px 14px"}}><span className={`tag tag-${statusColor[t.status]}`}>{t.status}</span></td>
                      <td style={{padding: "12px 14px"}}><span className={`tag tag-${prioColor[t.prio]}`}>{t.prio}</span></td>
                      <td style={{padding: "12px 14px"}}><Assignees names={t.assignees} size={20}/></td>
                      <td style={{padding: "12px 14px", color: "var(--n-text-muted)"}}>{t.due}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{padding: "10px 14px", color: "var(--n-text-muted)", fontSize: 12, borderTop: "0.5px solid var(--n-border)"}}>← 좌우로 스와이프 · 제목 고정</div>
          </div>
        )}

        {isTasks && view === "cal" && (
          <div style={{textAlign: "center", padding: "40px 20px", color: "var(--n-text-muted)"}}>
            <Icon name="calendar" size={36}/>
            <div style={{marginTop: 10}}>캘린더 뷰로 이동...</div>
            <button className="btn btn--sm" style={{marginTop: 12}} onClick={() => go("calendar")}>캘린더 열기</button>
          </div>
        )}

        <TabSpacer/>
      </div>

      {/* FAB */}
      <button className="fab" style={{right: 20, bottom: 96}} onClick={() => go("event-edit", {dbKey, dbId: subDbId})}>
        <Icon name="plus" size={24} color="var(--n-bg)"/>
      </button>

      <TabBar active={0} onChange={i => { if (i === 0) go("home"); else if (i === 1) go("search"); else if (i === 2) go("event-edit"); else if (i === 3) go("inbox"); else if (i === 4) go("settings"); }}/>
    </>
  );
}

/* ─── Calendar: Month grid + Agenda list (tap date = expand) ─── */
function CalendarScreen({ go, goBack, ctx }) {
  const today = new Date();
  const calAliasKey = "nm-db-alias-w-calendar";
  const [calAlias, setCalAlias] = uS2(() => (typeof localStorage !== "undefined" && localStorage.getItem(calAliasKey)) || "캘린더");
  const [viewYear, setViewYear] = uS2(today.getFullYear());
  const [viewMonth, setViewMonth] = uS2(today.getMonth());
  const [sel, setSel] = uS2(today.getDate());
  const [events, setEvents] = uS2({});
  const [loading, setLoading] = uS2(true);

  function catToColor(cat) {
    const l = (cat || "").toLowerCase();
    if (l.includes("design")) return "blue";
    if (l.includes("dev") || l.includes("api")) return "purple";
    if (l.includes("research")) return "green";
    if (l.includes("meeting")) return "brown";
    if (l.includes("urgent") || l.includes("release")) return "red";
    if (l.includes("copy") || l.includes("brand")) return "yellow";
    return "gray";
  }
  function fmtTimeRange(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    const h = String(d.getHours()).padStart(2, "0");
    const m = String(d.getMinutes()).padStart(2, "0");
    if (h === "00" && m === "00") return "종일";
    return `${h}:${m}`;
  }

  const fetchEvents = React.useCallback(() => {
    fetch("/api/tasks")
      .then(r => r.ok ? r.json() : { data: [] })
      .then(j => {
        const arr = j.data || [];
        const map = {};
        arr.forEach(t => {
          if (!t.dueDate) return;
          const d = new Date(t.dueDate);
          if (d.getFullYear() !== viewYear || d.getMonth() !== viewMonth) return;
          const day = d.getDate();
          if (!map[day]) map[day] = [];
          map[day].push({
            id: t.id,
            t: t.title,
            c: catToColor(t.category),
            time: fmtTimeRange(t.dueDate),
            done: !!t.done,
          });
        });
        setEvents(map);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [viewYear, viewMonth]);
  React.useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 20000);
    const onVis = () => { if (!document.hidden) fetchEvents(); };
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("focus", fetchEvents);
    return () => { clearInterval(interval); document.removeEventListener("visibilitychange", onVis); window.removeEventListener("focus", fetchEvents); };
  }, [fetchEvents]);

  const toggleDone = async (eventId, currentDone) => {
    // Optimistic update
    const next = {...events};
    Object.keys(next).forEach(day => {
      next[day] = next[day].map(e => e.id === eventId ? {...e, done: !currentDone} : e);
    });
    setEvents(next);
    try {
      await fetch(`/api/pages/${eventId}`, {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({properties: {Completed: {checkbox: !currentDone}}}),
      });
    } catch (e) {
      // Revert on error
      const revert = {...next};
      Object.keys(revert).forEach(day => {
        revert[day] = revert[day].map(e => e.id === eventId ? {...e, done: currentDone} : e);
      });
      setEvents(revert);
    }
  };

  const firstDow = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <>
      <NavBar title={<span style={{display: "inline-flex", alignItems: "center", gap: 8}}>
          <span
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => {
              const v = e.currentTarget.innerText.trim();
              const newName = (!v || v === "캘린더") ? "" : v;
              if (newName) localStorage.setItem(calAliasKey, newName);
              else localStorage.removeItem(calAliasKey);
              setCalAlias(newName || "캘린더");
              // propagate to calendar widget on home
              try {
                const sectionsRaw = localStorage.getItem("nm-sections");
                const sections = sectionsRaw ? JSON.parse(sectionsRaw) : [{id:"default"},{id:"widgets"}];
                sections.forEach(sec => {
                  const key = `nm-section-${sec.id}-widgets`;
                  let list;
                  try { list = JSON.parse(localStorage.getItem(key) || "null"); } catch { list = null; }
                  if (!Array.isArray(list)) {
                    if (sec.id !== "default") return;
                    list = [
                      { key: "tasks", dbKey: "tasks", n: "태스크", c: "#DDEDEA", fg: "#448361", icon: "✓", go: "db-list", core: true },
                      { key: "calendar", dbKey: "tasks", n: "캘린더", c: "#DDEBF1", fg: "#337EA9", icon: "📅", go: "calendar", core: true },
                      { key: "works", dbKey: "works", n: "웍스", c: "#EAE4F2", fg: "#9065B0", icon: "◆", go: "db-list", core: true },
                      { key: "insights", dbKey: "insights", n: "인사이트", c: "#FBF3DB", fg: "#CB912F", icon: "✎", go: "db-list", core: true },
                      { key: "finance", dbKey: "finance", n: "가계부", c: "#FDEBEC", fg: "#D44C47", icon: "₩", go: "db-list", core: true },
                      { key: "reflection", dbKey: "reflection", n: "스크립트", c: "#F4EEEE", fg: "#9F6B53", icon: "✐", go: "db-list", core: true },
                    ];
                  }
                  let changed = false;
                  const next = list.map(w => {
                    if (w.key === "calendar") { changed = true; return {...w, n: newName || "캘린더"}; }
                    return w;
                  });
                  if (changed) {
                    localStorage.setItem(key, JSON.stringify(next));
                    window.dispatchEvent(new CustomEvent("nm-section-update", {detail: {sectionId: sec.id}}));
                  }
                });
              } catch {}
            }}
            style={{outline: "none", cursor: "text", padding: "0 2px"}}
          >{calAlias}</span>
          <span style={{color: "var(--n-text-muted)", fontWeight: 500}}>{viewMonth + 1}월 {viewYear}</span>
        </span>} large={false}
        left={<NavIconBtn icon="back" onClick={goBack}/>}
        right={<><NavIconBtn icon="search" onClick={() => go("search")}/><NavIconBtn icon="plus" onClick={() => go("event-edit")}/></>}
      />
      <div style={{flex: 1, overflowY: "auto"}} className="scroll-fade">
        {/* Weekday header */}
        <div style={{display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "4px 10px 6px"}}>
          {["일","월","화","수","목","금","토"].map((d, i) => (
            <div key={d} className="t-caption" style={{textAlign: "center", padding: "6px 0", color: i === 0 ? "#D44C47" : "var(--n-text-muted)"}}>{d}</div>
          ))}
        </div>
        {/* Month grid — 단순한 숫자 + 개수 뱃지 */}
        <div style={{display: "grid", gridTemplateColumns: "repeat(7, 1fr)", padding: "0 10px", rowGap: 4}}>
          {cells.map((d, i) => {
            const isSun = i % 7 === 0;
            const ev = d && events[d];
            const count = ev ? ev.length : 0;
            const isSel = d === sel;
            const isToday = d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            return (
              <div key={i} onClick={() => d && setSel(d)} style={{
                height: 58, padding: "4px 2px 2px", cursor: d ? "pointer" : "default",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start",
                userSelect: "none", gap: 4, position: "relative",
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 16,
                  display: "grid", placeItems: "center",
                  background: isSel ? "var(--n-accent)" : isToday ? "var(--n-surface-hover)" : "transparent",
                  color: isSel ? "var(--n-bg)" : isSun ? "#D44C47" : "var(--n-text)",
                  fontWeight: isToday || isSel ? 700 : 500,
                  fontSize: 15,
                }} className="num">{d || ""}</div>
                <div style={{ height: 16, display: "flex", alignItems: "center" }}>
                  {count > 0 && (
                    <div style={{
                      minWidth: 16, height: 16,
                      padding: "0 5px",
                      borderRadius: 8,
                      background: isSel ? "var(--n-bg)" : "var(--n-tag-blue-bg)",
                      color: isSel ? "var(--n-accent)" : "var(--n-tag-blue-fg)",
                      fontSize: 10,
                      fontWeight: 600,
                      display: "grid",
                      placeItems: "center",
                      lineHeight: 1,
                    }}>{count}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Agenda for selected date */}
        <div className="g-header" style={{marginTop: 14}}>
          {viewMonth + 1}월 {sel}일 · {events[sel]?.length || 0}개 일정
        </div>
        <div className="g-list">
          {(events[sel] || []).map((e, i) => (
            <div key={i} className="g-row" style={{cursor: "pointer"}}>
              <button
                type="button"
                onClick={(ev2) => { ev2.stopPropagation(); toggleDone(e.id, e.done); }}
                aria-label={e.done ? "완료 취소" : "완료"}
                style={{
                  width: 20, height: 20, borderRadius: 4,
                  border: e.done ? "none" : "1.5px solid var(--n-border-strong)",
                  background: e.done ? "var(--n-accent)" : "transparent",
                  display: "grid", placeItems: "center",
                  cursor: "pointer", flexShrink: 0, marginRight: 4,
                }}
              >
                {e.done && <Icon name="check" size={12} color="var(--n-bg)"/>}
              </button>
              <div style={{width: 3, alignSelf: "stretch", borderRadius: 2, background: `var(--n-tag-${e.c}-fg)`, margin: "2px 4px 2px 0"}}/>
              <div style={{flex: 1, minWidth: 0}} onClick={() => go("page", {id: e.id})}>
                <div className="t-headline" style={{textDecoration: e.done ? "line-through" : "none", color: e.done ? "var(--n-text-muted)" : "var(--n-text-strong)"}}>{e.t}</div>
                <div className="t-footnote" style={{display: "flex", gap: 10, alignItems: "center"}}>
                  <span>{e.time}</span>
                </div>
              </div>
              <div className="chev" onClick={() => go("page", {id: e.id})}/>
            </div>
          ))}
          {!events[sel] && (
            <div style={{padding: "20px 16px", textAlign: "center", color: "var(--n-text-muted)"}} className="t-footnote">
              일정이 없어요. <span style={{color: "var(--n-text-strong)", fontWeight: 500, marginLeft: 4, cursor: "pointer"}} onClick={() => go("event-edit")}>+ 추가</span>
            </div>
          )}
        </div>

        <TabSpacer/>
      </div>
      <TabBar active={0} onChange={i => { if (i === 0) go("home"); else if (i === 1) go("search"); else if (i === 2) go("event-edit"); else if (i === 3) go("inbox"); else if (i === 4) go("settings"); }}/>
    </>
  );
}

/* ── Finance (가계부) grouped view ──────────────── */
function FinanceView({ go, items, loading }) {
  const [tab, setTab] = uS2("all"); // all | expense | income

  if (loading) return <div style={{padding: 20, textAlign: "center", color: "var(--n-text-muted)"}}>불러오는 중...</div>;

  const expenses = items.filter(i => i.type === "expense");
  const incomes = items.filter(i => i.type === "income");

  const expenseTotal = expenses.reduce((s, i) => s + (i.amount || 0), 0);
  const incomeTotal = incomes.reduce((s, i) => s + (i.amount || 0), 0);
  const net = incomeTotal - expenseTotal;

  const displayList = tab === "all" ? items : tab === "expense" ? expenses : incomes;

  return (
    <>
      {/* Summary card */}
      <div style={{
        background: "var(--n-surface)", borderRadius: 16,
        padding: 16, marginBottom: 14,
        boxShadow: "var(--sh-1)",
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12,
      }}>
        <div>
          <div className="t-caption">수입</div>
          <div style={{fontSize: 17, fontWeight: 700, color: "var(--n-tag-green-fg)", marginTop: 4}}>+₩{incomeTotal.toLocaleString()}</div>
        </div>
        <div>
          <div className="t-caption">지출</div>
          <div style={{fontSize: 17, fontWeight: 700, color: "var(--n-tag-red-fg)", marginTop: 4}}>-₩{expenseTotal.toLocaleString()}</div>
        </div>
        <div>
          <div className="t-caption">잔액</div>
          <div style={{fontSize: 17, fontWeight: 700, color: net >= 0 ? "var(--n-text-strong)" : "var(--n-tag-red-fg)", marginTop: 4}}>₩{net.toLocaleString()}</div>
        </div>
      </div>

      {/* Tab pills */}
      <div style={{display: "flex", gap: 6, marginBottom: 12, overflowX: "auto"}} className="hide-scroll">
        {[
          {k: "all",     label: "전체",  count: items.length},
          {k: "expense", label: "지출",  count: expenses.length},
          {k: "income",  label: "수입",  count: incomes.length},
        ].map(t => {
          const on = tab === t.k;
          return (
            <button key={t.k} onClick={() => setTab(t.k)} style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 12px", borderRadius: 16, border: "none",
              background: on ? "var(--n-accent)" : "var(--n-surface)",
              color: on ? "var(--n-bg)" : "var(--n-text)",
              fontSize: 14, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
              boxShadow: on ? "none" : "var(--sh-1)",
            }}>
              {t.label}
              <span style={{
                minWidth: 18, padding: "0 5px", borderRadius: 9,
                background: on ? "var(--n-bg)" : "var(--n-surface-hover)",
                color: on ? "var(--n-accent)" : "var(--n-text-muted)",
                fontSize: 11, fontWeight: 600,
              }}>{t.count}</span>
            </button>
          );
        })}
      </div>

      {displayList.length === 0 ? (
        <div style={{textAlign: "center", padding: "40px 20px", color: "var(--n-text-muted)"}} className="t-footnote">항목이 없어요</div>
      ) : (
        displayList.map((f) => (
          <div key={f.id}
            onClick={() => go("page", {id: f.id})}
            style={{
              background: "var(--n-surface)", borderRadius: 14,
              padding: "12px 14px", marginBottom: 8,
              boxShadow: "var(--sh-1)", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12,
              borderLeft: `3px solid ${f.type === "income" ? "var(--n-tag-green-fg)" : "var(--n-tag-red-fg)"}`,
            }}>
            <div style={{flex: 1, minWidth: 0}}>
              <div className="t-body" style={{fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{f.client || f.title || "(미기입)"}</div>
              <div className="t-footnote" style={{marginTop: 2}}>
                {f.date ? new Date(f.date).toLocaleDateString("ko-KR") : "날짜 미지정"}
                {f.category ? ` · ${f.category}` : ""}
              </div>
            </div>
            <div style={{fontWeight: 600, fontSize: 15, color: f.type === "income" ? "var(--n-tag-green-fg)" : "var(--n-tag-red-fg)"}}>
              {f.type === "income" ? "+" : "-"}₩{(f.amount || 0).toLocaleString()}
            </div>
          </div>
        ))
      )}
    </>
  );
}

Object.assign(window, { DbListScreen, CalendarScreen, TaskCard, Assignees, ViewSwitcher, FinanceView });
