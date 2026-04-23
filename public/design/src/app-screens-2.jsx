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

const DB_ID_BY_KEY_2 = {
  tasks:      "242003c7-f7be-804a-9d6e-f76d5d0347b4",
  works:      "241003c7-f7be-8011-8ba4-cecf131df2a0",
  insights:   "241003c7-f7be-800b-b71c-df3acddc5bb8",
  finance:    "28f003c7-f7be-8080-85b4-d73efe3cb896",
  reflection: "31e003c7-f7be-80a0-ab4f-c1e2249f3c24",
};
function coreDbId2(key) {
  const mapped = window.nmCoreDbId?.(key);
  if (mapped) return mapped;
  if (window.nmConnectionMode?.() === "owner") return DB_ID_BY_KEY_2[key] || DB_ID_BY_KEY_2.tasks;
  return null;
}

function notionUrlFromId(id) {
  return id ? `https://notion.so/${String(id).replace(/-/g, "")}` : "";
}

function itemSortValue(item, sort) {
  if (sort === "title_asc" || sort === "title_desc") return (item.title || item.client || item.t || "").toLowerCase();
  return new Date(item.lastEditedAt || item.createdAt || item.date || item._raw?.lastEditedAt || 0).getTime();
}

function sortItems(list, sort) {
  const next = list.slice();
  next.sort((a, b) => {
    const av = itemSortValue(a, sort);
    const bv = itemSortValue(b, sort);
    if (sort === "title_asc") return String(av).localeCompare(String(bv));
    if (sort === "title_desc") return String(bv).localeCompare(String(av));
    if (sort === "edited_asc") return Number(av) - Number(bv);
    return Number(bv) - Number(av);
  });
  return next;
}

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
  const subDbId = ctx?.dbId || null;
  const subTitle = ctx?.subTitle || null;
  const hasCustomDb = !!ctx?.dbId && !dbKey;
  const hasNestedDb = !!ctx?.dbId && !!dbKey;
  const usesGenericDb = !!ctx?.dbId;
  const cfg = usesGenericDb
    ? { endpoint: `database-pages?dbId=${ctx.dbId}`, title: ctx.subTitle || "데이터베이스" }
    : (DB_CONFIG[dbKey || "tasks"] || DB_CONFIG.tasks);
  const isTasks = !usesGenericDb && (dbKey || "tasks") === "tasks";

  const [view, setView] = uS2("list");
  const [tasks, setTasks] = uS2([]);
  const [items, setItems] = uS2([]);
  const [dbSchema, setDbSchema] = uS2([]);
  const [loading, setLoading] = uS2(true);
  const [filter, setFilter] = uS2("today"); // today | tomorrow | overdue
  const [query, setQuery] = uS2("");
  const [createOpen, setCreateOpen] = uS2(false);
  const filterKey = `nm-dbfilter-${ctx?.dbId || dbKey || "tasks"}`;
  const defaultDbFilter = { sort: "edited_desc", taskStatus: "open", category: "", propertyName: "", propertyValue: "" };
  const [dbFilter, setDbFilter] = uS2(() => {
    try { return { ...defaultDbFilter, ...(JSON.parse(localStorage.getItem(filterKey) || "{}")) }; }
    catch { return defaultDbFilter; }
  });
  const [filterOpen, setFilterOpen] = uS2(false);
  const [moreOpen, setMoreOpen] = uS2(false);
  const endpointUrl = usesGenericDb
    ? `/api/database-pages?dbId=${encodeURIComponent(ctx.dbId)}`
    : (window.nmCoreEndpoint?.(dbKey || "tasks") || `/api/${cfg.endpoint}`);
  const dbNotionUrl = notionUrlFromId(ctx?.dbId || coreDbId2(dbKey || "tasks"));

  const updateDbFilter = (patch) => {
    const next = { ...dbFilter, ...patch };
    setDbFilter(next);
    localStorage.setItem(filterKey, JSON.stringify(next));
  };
  React.useEffect(() => {
    try { setDbFilter({ ...defaultDbFilter, ...(JSON.parse(localStorage.getItem(filterKey) || "{}")) }); }
    catch { setDbFilter(defaultDbFilter); }
    setQuery("");
  }, [filterKey]);

  const toggleTaskDone = async (taskId, currentDone) => {
    setTasks(tasks.map(t => t.id === taskId ? {...t, status: currentDone ? "진행중" : "완료", _raw: {...t._raw, done: !currentDone}} : t));
    try {
      const taskUrl = window.nmCoreEndpoint?.("tasks") || "/api/tasks";
      await fetch(taskUrl, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({id: taskId, done: !currentDone, dbId: coreDbId2("tasks")}),
      });
      window.nmInvalidate && window.nmInvalidate("/api/tasks");
      window.nmInvalidate && window.nmInvalidate(taskUrl);
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
    if (dbFilter.taskStatus === "open" && isDone) return false;
    if (dbFilter.taskStatus === "done" && !isDone) return false;
    const dd = dueDateOf(t);
    if (filter === "today") return dd && sameDay(dd, nowDay);
    if (filter === "tomorrow") return dd && sameDay(dd, tomDay);
    if (filter === "overdue") return dd && dd < nowDay;
    return true;
  });
  const sortedFilteredTasks = sortItems(filteredTasks, dbFilter.sort);

  // Group filtered tasks by category
  const grouped = sortedFilteredTasks.reduce((acc, t) => {
    const cat = (t._raw?.category) || "기타";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(t);
    return acc;
  }, {});

  const fetchDbData = React.useCallback((showLoader = true) => {
    const hasCache = window.__nmCache?.has(endpointUrl);
    if (showLoader && !hasCache) setLoading(true);
    window.nmFetch(endpointUrl)
      .then(j => j || { data: [] })
      .then(j => {
        const raw = j.data || [];
        setDbSchema(Array.isArray(j.schema) ? j.schema : []);
        if (isTasks) setTasks(raw.map(mapNotionTaskToCard));
        else setItems(raw);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [endpointUrl, isTasks]);
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
  const genericFilterProps = React.useMemo(() => (
    usesGenericDb
      ? dbSchema.filter(p => ["select", "status", "multi_select", "checkbox"].includes(p.type))
      : []
  ), [usesGenericDb, dbSchema]);
  const activeGenericFilter = genericFilterProps.find(p => p.name === dbFilter.propertyName) || null;
  const genericFilterOptions = activeGenericFilter?.type === "checkbox"
    ? [{name: "true", label: "체크됨"}, {name: "false", label: "체크 안 됨"}]
    : (activeGenericFilter?.options || []).map(o => ({name: o.name, label: o.name}));
  const visibleItems = sortItems((query.trim()
    ? items.filter((i) => {
        const needle = query.toLowerCase();
        const haystack = [
          i.title,
          i.client,
          i.category,
          ...(Array.isArray(i.preview) ? i.preview.map(p => `${p.name} ${p.text}`) : []),
          ...(Array.isArray(i.properties) ? i.properties.map(p => `${p.name} ${p.text}`) : []),
        ].filter(Boolean).join(" ").toLowerCase();
        return haystack.includes(needle);
      })
    : items
  ).filter((i) => {
    if (usesGenericDb && dbFilter.propertyName && dbFilter.propertyValue) {
      const prop = (i.properties || []).find(p => p.name === dbFilter.propertyName);
      if (!prop) return false;
      if (prop.type === "checkbox") return dbFilter.propertyValue === "true" ? prop.value === true : prop.value !== true;
      if (Array.isArray(prop.value)) return prop.value.includes(dbFilter.propertyValue);
      return String(prop.value ?? prop.text ?? "") === dbFilter.propertyValue;
    }
    if (!dbFilter.category) return true;
    return (i.category || i.type || "") === dbFilter.category;
  }), dbFilter.sort);
  const categoryOptions = usesGenericDb ? [] : Array.from(new Set(items.map(i => i.category || i.type).filter(Boolean))).sort();
  const genericTableColumns = usesGenericDb ? dbSchema.filter(p => p.type !== "title").slice(0, 4) : [];
  const genericBoardProp = usesGenericDb
    ? (genericFilterProps.find(p => ["status", "select"].includes(p.type)) || genericFilterProps[0] || null)
    : null;
  const genericBoardGroups = React.useMemo(() => {
    if (!usesGenericDb || !genericBoardProp) return [];
    const groups = {};
    visibleItems.forEach(item => {
      const prop = (item.properties || []).find(p => p.name === genericBoardProp.name);
      let labels = [];
      if (Array.isArray(prop?.value)) labels = prop.value.length ? prop.value : ["비어 있음"];
      else if (prop?.type === "checkbox") labels = [prop.value ? "체크됨" : "체크 안 됨"];
      else labels = [prop?.text || "비어 있음"];
      labels.forEach(label => {
        groups[label] = groups[label] || [];
        groups[label].push(item);
      });
    });
    return Object.entries(groups);
  }, [usesGenericDb, genericBoardProp, visibleItems]);
  const filterActive =
    dbFilter.sort !== defaultDbFilter.sort ||
    (isTasks && dbFilter.taskStatus !== defaultDbFilter.taskStatus) ||
    (!isTasks && !!dbFilter.category) ||
    (usesGenericDb && !!(dbFilter.propertyName && dbFilter.propertyValue));
  const subtitle = loading
    ? "불러오는 중..."
    : isTasks
      ? `${openCount} open · ${tasks.length} total`
      : `${items.length}개`;

  // Alias support — user can rename DB display title; stored per dbId/dbKey
  const aliasKey = usesGenericDb ? `nm-db-alias-${ctx?.dbId}` : (ctx?.widgetKey ? `nm-db-alias-w-${ctx.widgetKey}` : (dbKey ? `nm-db-alias-${dbKey}` : null));
  const baseTitle = usesGenericDb
    ? (hasNestedDb ? `${(DB_CONFIG[dbKey] || {}).title || "데이터베이스"} · ${subTitle || cfg.title}` : cfg.title)
    : cfg.title;
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
          const CORE_WIDGETS_FALLBACK = window.defaultCoreWidgetsForConnection?.() || [
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
    if (hasNestedDb) {
      go("db-list", {dbKey});
      return;
    }
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
  const pinOffHome = () => {
    try {
      const sectionsRaw = localStorage.getItem("nm-sections");
      const sections = sectionsRaw ? JSON.parse(sectionsRaw) : [{id:"default"},{id:"widgets"}];
      sections.forEach(sec => {
        const key = `nm-section-${sec.id}-widgets`;
        let list;
        try { list = JSON.parse(localStorage.getItem(key) || "[]"); } catch { list = []; }
        if (!Array.isArray(list)) return;
        const next = list.filter(w => {
          if (ctx?.dbId) return w.dbId !== ctx.dbId;
          return !(dbKey && (w.dbKey === dbKey || w.key === dbKey));
        });
        if (next.length !== list.length) {
          localStorage.setItem(key, JSON.stringify(next));
          window.dispatchEvent(new CustomEvent("nm-section-update", {detail: {sectionId: sec.id}}));
        }
      });
      window.nmToast && window.nmToast("홈에서 핀 해제됨");
    } catch {
      window.nmToast && window.nmToast("핀 해제 실패");
    }
    setMoreOpen(false);
  };
  const refreshNow = () => {
    window.nmInvalidate && window.nmInvalidate(endpointUrl);
    fetchDbData(true);
    window.nmToast && window.nmToast("새로고침 중");
    setMoreOpen(false);
  };
  const copyDbLink = async () => {
    const ok = await window.nmCopyText(dbNotionUrl);
    window.nmToast && window.nmToast(ok ? "링크 복사됨" : "복사 권한 필요");
    setMoreOpen(false);
  };

  return (
    <>
      <NavBar title={editableTitle} subtitle={subtitle}
        left={<NavIconBtn icon="back" onClick={handleBack}/>}
        right={<><NavIconBtn icon="filter" badge={filterActive} onClick={() => setFilterOpen(true)}/><NavIconBtn icon="more" onClick={() => setMoreOpen(true)}/></>}
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

            {usesGenericDb && (
              <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6, marginBottom: 10}}>
                {[
                  ["list", "목록"],
                  ["table", "표"],
                  ["board", "보드"],
                ].map(([k, label]) => (
                  <button key={k} onClick={() => setView(k)} style={{
                    border: "none",
                    borderRadius: 12,
                    padding: "9px 8px",
                    background: view === k ? "var(--n-accent)" : "var(--n-surface)",
                    color: view === k ? "var(--n-bg)" : "var(--n-text)",
                    fontWeight: 700,
                    cursor: "pointer",
                    boxShadow: view === k ? "none" : "var(--sh-1)",
                  }}>{label}</button>
                ))}
              </div>
            )}

            {(() => {
              const visible = visibleItems;
              if (visible.length === 0 && !loading) {
                return <div style={{textAlign: "center", padding: "40px 20px", color: "var(--n-text-muted)"}} className="t-footnote">{query ? "일치 항목 없음" : "항목이 없어요"}</div>;
              }
              if (usesGenericDb && view === "table") {
                return (
                  <div style={{background: "var(--n-surface)", borderRadius: 14, overflow: "hidden", boxShadow: "var(--sh-1)"}}>
                    <div style={{overflowX: "auto"}} className="hide-scroll">
                      <table style={{borderCollapse: "collapse", minWidth: 520, fontSize: 13}}>
                        <thead>
                          <tr style={{background: "var(--n-surface-hover)"}}>
                            {["이름", ...genericTableColumns.map(c => c.name)].map((h, i) => (
                              <th key={h} style={{
                                textAlign: "left", padding: "10px 12px",
                                fontSize: 12, fontWeight: 700, color: "var(--n-text-muted)",
                                position: i === 0 ? "sticky" : "static", left: 0,
                                background: "var(--n-surface-hover)", minWidth: i === 0 ? 170 : 110,
                              }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {visible.map(it => (
                            <tr key={it.id} onClick={() => go("page", {id: it.id})} style={{borderTop: "0.5px solid var(--n-border)", cursor: "pointer"}}>
                              <td style={{padding: "11px 12px", fontWeight: 600, position: "sticky", left: 0, background: "var(--n-surface)", minWidth: 170}}>{it.title || "(제목 없음)"}</td>
                              {genericTableColumns.map(col => {
                                const prop = (it.properties || []).find(p => p.name === col.name);
                                return <td key={col.name} style={{padding: "11px 12px", color: "var(--n-text-muted)", whiteSpace: "nowrap"}}>{prop?.text || ""}</td>;
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              }
              if (usesGenericDb && view === "board" && genericBoardProp) {
                return (
                  <div style={{display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8}} className="hide-scroll">
                    {genericBoardGroups.map(([label, list]) => (
                      <div key={label} style={{flex: "0 0 220px", background: "var(--n-bg-grouped)", borderRadius: 14, padding: 10}}>
                        <div className="t-caption" style={{display: "flex", justifyContent: "space-between", padding: "2px 2px 8px"}}>
                          <span>{label}</span><span>{list.length}</span>
                        </div>
                        {list.map(it => (
                          <div key={it.id} onClick={() => go("page", {id: it.id})} style={{
                            background: "var(--n-surface)",
                            borderRadius: 12,
                            padding: "10px 11px",
                            marginBottom: 8,
                            boxShadow: "var(--sh-1)",
                            cursor: "pointer",
                          }}>
                            <div className="t-body" style={{fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{it.title || "(제목 없음)"}</div>
                            {(it.preview || []).slice(0, 2).map(p => (
                              <div key={p.name} className="t-footnote muted" style={{marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>{p.name}: {p.text}</div>
                            ))}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                );
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
                      {usesGenericDb && Array.isArray(it.preview) && it.preview.length > 0 ? (
                        <div className="t-footnote" style={{marginTop: 6, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center"}}>
                          {it.preview.slice(0, 4).map(p => (
                            <span key={`${it.id}-${p.name}`} style={{
                              maxWidth: "100%",
                              padding: "3px 7px",
                              borderRadius: 8,
                              background: "var(--n-surface-hover)",
                              color: "var(--n-text-muted)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}>{p.name}: {p.text}</span>
                          ))}
                        </div>
                      ) : (
                        <div className="t-footnote" style={{marginTop: 2, display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center"}}>
                          {it.category && <span>{it.category}</span>}
                          {it.category && dateStr && <span style={{color: "var(--n-text-faint)"}}>·</span>}
                          {dateStr && <span>{dateStr}</span>}
                        </div>
                      )}
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
          <FinanceView go={go} items={visibleItems} loading={loading}/>
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

            {sortedFilteredTasks.length === 0 ? (
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
                  <button className="btn btn--ghost btn--sm" style={{width: "100%", justifyContent: "flex-start", padding: "8px 8px"}} onClick={() => go("event-edit", {dbKey: "tasks"})}>
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
      <button className="fab" style={{right: 20, bottom: "calc(var(--nm-tabbar-space, 100px) + 4px)"}} onClick={() => go("event-edit", {dbKey, dbId: subDbId})}>
        <Icon name="plus" size={24} color="var(--n-bg)"/>
      </button>

      <TabBar active={0} onChange={i => { if (i === 0) go("home"); else if (i === 1) go("search"); else if (i === 2) go("event-edit"); else if (i === 3) go("inbox"); else if (i === 4) go("settings"); }}/>

      <ActionSheet open={filterOpen} title="필터와 정렬" subtitle={effectiveTitle} onClose={() => setFilterOpen(false)}>
        <div style={{padding: "0 18px 10px"}}>
          <div className="t-caption" style={{marginBottom: 8}}>정렬</div>
          <div style={{display: "grid", gap: 6}}>
            {[
              ["edited_desc", "최근 수정 먼저"],
              ["edited_asc", "오래된 수정 먼저"],
              ["title_asc", "제목 A-Z"],
              ["title_desc", "제목 Z-A"],
            ].map(([k, label]) => (
              <button key={k} onClick={() => updateDbFilter({sort: k})} style={{
                border: "none", borderRadius: 12, padding: "10px 12px", textAlign: "left",
                background: dbFilter.sort === k ? "var(--n-accent)" : "var(--n-surface)",
                color: dbFilter.sort === k ? "var(--n-bg)" : "var(--n-text)",
                fontWeight: 600, cursor: "pointer",
              }}>{label}</button>
            ))}
          </div>
        </div>
        {isTasks && (
          <div style={{padding: "4px 18px 10px"}}>
            <div className="t-caption" style={{marginBottom: 8}}>완료 상태</div>
            <div style={{display: "flex", gap: 6}}>
              {[
                ["all", "전체"],
                ["open", "미완료"],
                ["done", "완료"],
              ].map(([k, label]) => (
                <button key={k} onClick={() => updateDbFilter({taskStatus: k})} style={{
                  flex: 1, border: "none", borderRadius: 12, padding: "10px 8px",
                  background: dbFilter.taskStatus === k ? "var(--n-accent)" : "var(--n-surface)",
                  color: dbFilter.taskStatus === k ? "var(--n-bg)" : "var(--n-text)",
                  fontWeight: 600, cursor: "pointer",
                }}>{label}</button>
              ))}
            </div>
          </div>
        )}
        {usesGenericDb && genericFilterProps.length > 0 && (
          <div style={{padding: "4px 18px 10px"}}>
            <div className="t-caption" style={{marginBottom: 8}}>속성 필터</div>
            <div style={{display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6}} className="hide-scroll">
              {genericFilterProps.map(prop => (
                <button key={prop.name} onClick={() => updateDbFilter({propertyName: prop.name, propertyValue: ""})} style={{
                  flexShrink: 0, border: "none", borderRadius: 16, padding: "8px 12px",
                  background: dbFilter.propertyName === prop.name ? "var(--n-accent)" : "var(--n-surface)",
                  color: dbFilter.propertyName === prop.name ? "var(--n-bg)" : "var(--n-text)",
                  fontWeight: 600, cursor: "pointer",
                }}>{prop.name}</button>
              ))}
            </div>
            {activeGenericFilter && (
              <div style={{display: "flex", gap: 6, overflowX: "auto"}} className="hide-scroll">
                {[{name: "", label: "전체"}, ...genericFilterOptions].map(opt => (
                  <button key={opt.name || "all"} onClick={() => updateDbFilter({propertyValue: opt.name})} style={{
                    flexShrink: 0, border: "none", borderRadius: 16, padding: "8px 12px",
                    background: dbFilter.propertyValue === opt.name ? "var(--n-accent)" : "var(--n-surface)",
                    color: dbFilter.propertyValue === opt.name ? "var(--n-bg)" : "var(--n-text)",
                    fontWeight: 600, cursor: "pointer",
                  }}>{opt.label}</button>
                ))}
              </div>
            )}
          </div>
        )}
        {!isTasks && categoryOptions.length > 0 && (
          <div style={{padding: "4px 18px 10px"}}>
            <div className="t-caption" style={{marginBottom: 8}}>카테고리</div>
            <div style={{display: "flex", gap: 6, overflowX: "auto"}} className="hide-scroll">
              {[["", "전체"], ...categoryOptions.map(c => [c, c])].map(([k, label]) => (
                <button key={k || "all"} onClick={() => updateDbFilter({category: k})} style={{
                  flexShrink: 0, border: "none", borderRadius: 16, padding: "8px 12px",
                  background: dbFilter.category === k ? "var(--n-accent)" : "var(--n-surface)",
                  color: dbFilter.category === k ? "var(--n-bg)" : "var(--n-text)",
                  fontWeight: 600, cursor: "pointer",
                }}>{label}</button>
              ))}
            </div>
          </div>
        )}
        <div style={{padding: "4px 18px 0"}}>
          <button className="btn btn--ghost btn--sm" style={{width: "100%"}} onClick={() => updateDbFilter(defaultDbFilter)}>
            기본값으로 재설정
          </button>
        </div>
      </ActionSheet>

      <ActionSheet open={moreOpen} title="데이터베이스" subtitle={effectiveTitle} onClose={() => setMoreOpen(false)}>
        <ActionRow icon="share" title="Notion에서 열기" subtitle="원본 데이터베이스 열기" onClick={() => { window.open(dbNotionUrl, "_blank"); setMoreOpen(false); }}/>
        <ActionRow icon="link" title="링크 복사" subtitle="Notion URL 복사" onClick={copyDbLink}/>
        <ActionRow icon="sync" title="새로고침" subtitle="캐시를 지우고 다시 불러오기" onClick={refreshNow}/>
        <ActionRow icon="archive" title="홈에서 핀 해제" subtitle="이 홈 카드만 제거" onClick={pinOffHome}/>
      </ActionSheet>
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
    const taskUrl = window.nmCoreEndpoint?.("calendar") || window.nmCoreEndpoint?.("tasks") || "/api/tasks";
    window.nmFetch(taskUrl)
      .then(j => j || { data: [] })
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
      window.nmInvalidate && window.nmInvalidate("/api/tasks");
      window.nmInvalidate && window.nmInvalidate(window.nmCoreEndpoint?.("calendar") || "/api/tasks");
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

  const shiftMonth = (delta) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    // Clamp selection to valid day in new month
    const newDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
    setSel(Math.min(sel, newDays));
  };
  const goToToday = () => {
    const t = new Date();
    setViewYear(t.getFullYear());
    setViewMonth(t.getMonth());
    setSel(t.getDate());
  };
  const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

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
          <span style={{display: "inline-flex", alignItems: "center", gap: 2, color: "var(--n-text-muted)", fontWeight: 500}}>
            <button
              data-cal-prev
              onClick={(e) => { e.stopPropagation(); shiftMonth(-1); }}
              aria-label="이전 달"
              style={{
                border: "none", background: "transparent", padding: "4px 6px",
                color: "var(--n-text-muted)", cursor: "pointer",
                display: "inline-flex", alignItems: "center", borderRadius: 6,
              }}>
              <Icon name="chev-l" size={15} color="var(--n-text-muted)"/>
            </button>
            <button
              data-cal-today
              onClick={(e) => { e.stopPropagation(); goToToday(); }}
              aria-label="오늘"
              style={{
                border: "none", background: "transparent", padding: "2px 6px",
                color: "var(--n-text-muted)", cursor: "pointer", fontWeight: 500,
                fontSize: "inherit", borderRadius: 6,
              }}>{viewMonth + 1}월 {viewYear}</button>
            <button
              data-cal-next
              onClick={(e) => { e.stopPropagation(); shiftMonth(1); }}
              aria-label="다음 달"
              style={{
                border: "none", background: "transparent", padding: "4px 6px",
                color: "var(--n-text-muted)", cursor: "pointer",
                display: "inline-flex", alignItems: "center", borderRadius: 6,
              }}>
              <Icon name="chev-r" size={15} color="var(--n-text-muted)"/>
            </button>
          </span>
        </span>} large={false}
        left={<NavIconBtn icon="back" onClick={goBack}/>}
        right={<><NavIconBtn icon="search" onClick={() => go("search")}/><NavIconBtn icon="plus" onClick={() => go("event-edit", { dbKey: "tasks", date: iso(viewYear, viewMonth, sel) })}/></>}
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
