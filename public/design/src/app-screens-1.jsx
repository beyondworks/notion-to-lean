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
      <button className="btn btn--ghost" style={{marginTop: 8, width: "100%"}} onClick={() => go("home")}>둘러보기</button>
    </div>
  );
}

function TokenScreen({ go, goBack }) {
  const [val, setVal] = uS1("");
  return (
    <>
      <NavBar title="API 연결" large={false} left={<NavIconBtn icon="back" onClick={goBack}/>}/>
      <div style={{flex: 1, overflowY: "auto", padding: "0 0 40px"}}>
        <div style={{padding: "0 20px 24px"}}>
          <div className="t-title-1" style={{marginBottom: 8}}>Integration Token</div>
          <div className="t-body muted">
            notion.so/my-integrations 에서 Internal Integration Token을 발급하고 붙여넣어주세요.
          </div>
        </div>
        <div className="g-header">INTEGRATION TOKEN</div>
        <div className="g-list">
          <div className="g-row" style={{padding: 16}}>
            <input className="input" placeholder="secret_xxxxxxxxxxxxxxxx" value={val}
              onChange={e => setVal(e.target.value)}
              style={{background: "transparent", padding: 0, fontFamily: "var(--f-mono)", fontSize: 14}}/>
          </div>
        </div>
        <div style={{display: "flex", gap: 8, padding: "12px 20px 0"}}>
          <button className="btn btn--sm" onClick={() => setVal("secret_aB3kL9mNpQrStUvWxYz2c4D6f8G")}>📋 붙여넣기</button>
          <button className="btn btn--sm">📷 QR 스캔</button>
          <button className="btn btn--sm">❓ 도움말</button>
        </div>

        <div className="g-header" style={{marginTop: 24}}>연결된 워크스페이스</div>
        <div className="g-list">
          <div className="g-row g-row--with-icon" style={{padding: "14px 16px"}}>
            <div className="icon-tile icon-tile--lg" style={{background: "#DDEDEA", color: "#448361"}}>✓</div>
            <div style={{flex: 1}}>
              <div className="t-headline">현우's workspace</div>
              <div className="t-footnote">12 pages · 4 databases 감지됨</div>
            </div>
          </div>
        </div>

        <div style={{padding: "20px", marginTop: 8}}>
          <div className="t-footnote" style={{background: "var(--n-surface-hover)", padding: 12, borderRadius: 10, lineHeight: 1.5}}>
            🔒 토큰은 <b>기기 키체인</b>에만 저장되며 외부로 전송되지 않아요.
          </div>
        </div>
      </div>
      <div style={{padding: "12px 20px 28px", background: "var(--n-bg-grouped)"}}>
        <button className="btn btn--primary" style={{width: "100%"}} onClick={() => go("db-picker")} disabled={!val}>다음 · DB 선택</button>
      </div>
    </>
  );
}

function DbPickerScreen({ go, goBack }) {
  const [sel, setSel] = uS1({ tasks: true, cal: true, notes: true, reading: false, proj: true, inv: false });
  const dbs = [
    { k: "tasks",   n: "태스크",      sub: "128 items", i: "✓", c: "green" },
    { k: "cal",     n: "캘린더",      sub: "56 events", i: "📅", c: "blue" },
    { k: "notes",   n: "회의록",      sub: "24 pages",  i: "✎", c: "yellow" },
    { k: "reading", n: "Reading list",sub: "92 items",  i: "📖", c: "brown" },
    { k: "proj",    n: "프로젝트",    sub: "8 active",  i: "◆", c: "purple" },
    { k: "inv",     n: "인보이스",    sub: "14 rows",   i: "$", c: "gray" },
  ];
  const colorMap = { green: ["#DDEDEA","#448361"], blue: ["#DDEBF1","#337EA9"], yellow: ["#FBF3DB","#CB912F"], brown: ["#F4EEEE","#9F6B53"], purple: ["#EAE4F2","#9065B0"], gray: ["rgba(55,53,47,0.08)","#37352F"] };
  const count = Object.values(sel).filter(Boolean).length;
  return (
    <>
      <NavBar title="사용할 DB 선택" large={false}
        left={<NavIconBtn icon="back" onClick={goBack}/>}
        right={<button className="btn btn--sm btn--primary" onClick={() => go("home")} style={{padding: "6px 14px"}}>다음</button>}
      />
      <div style={{flex: 1, overflowY: "auto"}}>
        <div className="t-body muted" style={{padding: "4px 20px 16px"}}>
          자주 여는 DB만 켜두면 홈 첫 화면에 고정되고, 동기화도 빨라요. 언제든 바꿀 수 있어요.
        </div>
        <div className="g-list">
          {dbs.map((d, i) => {
            const [bg, fg] = colorMap[d.c];
            return (
              <div key={d.k} className="g-row g-row--with-icon">
                <div className="icon-tile icon-tile--lg" style={{background: bg, color: fg}}>{d.i}</div>
                <div style={{flex: 1}}>
                  <div className="t-headline">{d.n}</div>
                  <div className="t-footnote">{d.sub}</div>
                </div>
                <Toggle on={sel[d.k]} onChange={v => setSel({...sel, [d.k]: v})}/>
              </div>
            );
          })}
        </div>
        <div className="t-footnote" style={{padding: "14px 20px", textAlign: "center"}}>
          {count}개 선택됨 · 홈에 이 순서로 표시됩니다
        </div>
      </div>
    </>
  );
}

function HomeScreen({ go, goBack }) {
  // ── Mock fallbacks (shown if backend unavailable or returns empty) ─────
  const MOCK_TODAY = [
    { t: "디자인 리뷰", time: "10:00 AM", c: "blue" },
    { t: "스탠드업",    time: "11:00 AM", c: "yellow" },
    { t: "고객 인터뷰 · 강남 A룸", time: "2:00 PM", c: "orange" },
  ];
  const MOCK_DBS = [
    { key: "tasks",      n: "태스크",   c: "#DDEDEA", fg: "#448361", sub: "—",      icon: "✓", go: "db-list" },
    { key: "calendar",   n: "캘린더",   c: "#DDEBF1", fg: "#337EA9", sub: "—",      icon: "📅", go: "calendar" },
    { key: "works",      n: "웍스",     c: "#EAE4F2", fg: "#9065B0", sub: "—",      icon: "◆", go: "db-list" },
    { key: "insights",   n: "인사이트", c: "#FBF3DB", fg: "#CB912F", sub: "—",      icon: "✎", go: "db-list" },
    { key: "finance",    n: "가계부",   c: "#FDEBEC", fg: "#D44C47", sub: "—",      icon: "₩", go: "db-list" },
    { key: "reflection", n: "스크립트", c: "#F4EEEE", fg: "#9F6B53", sub: "—",      icon: "✐", go: "db-list" },
  ];
  const MOCK_RECENT = [
    { id: null, n: "Q2 로드맵", sub: "Projects · 어제",        icon: "🎯" },
    { id: null, n: "디자인 스프린트", sub: "Q2 · 2일 전",     icon: "🔨" },
    { id: null, n: "릴리스 체크리스트", sub: "Projects · 3일 전", icon: "📋" },
    { id: null, n: "리서치 노트", sub: "스프린트 · 3일 전",    icon: "🔍" },
  ];

  const [today, setToday] = uS1([]);
  const [dbs, setDbs] = uS1(MOCK_DBS);
  const [recent, setRecent] = uS1([]);
  const [loading, setLoading] = uS1(true);
  const [isMock, setIsMock] = uS1(false);

  uE1(() => {
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
      fetch("/api/tasks").then(r => r.ok ? r.json() : { data: [], mock: true }).catch(() => ({ data: [], mock: true })),
      fetch("/api/insights").then(r => r.ok ? r.json() : { data: [], mock: true }).catch(() => ({ data: [], mock: true })),
      fetch("/api/works").then(r => r.ok ? r.json() : { data: [], mock: true }).catch(() => ({ data: [], mock: true })),
      fetch("/api/finance").then(r => r.ok ? r.json() : { data: [], mock: true }).catch(() => ({ data: [], mock: true })),
      fetch("/api/reflection").then(r => r.ok ? r.json() : { data: [], mock: true }).catch(() => ({ data: [], mock: true })),
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
      const activeWorks = works.filter(w => w.status === "progress").length;

      setDbs([
        { key: "tasks",      n: "태스크",   c: "#DDEDEA", fg: "#448361", sub: `${openCount} open`,       icon: "✓",  go: "db-list" },
        { key: "calendar",   n: "캘린더",   c: "#DDEBF1", fg: "#337EA9", sub: `오늘 ${todayCount}`,       icon: "📅", go: "calendar" },
        { key: "works",      n: "웍스",     c: "#EAE4F2", fg: "#9065B0", sub: `${activeWorks} active`,   icon: "◆",  go: "db-list" },
        { key: "insights",   n: "인사이트", c: "#FBF3DB", fg: "#CB912F", sub: `${insights.length} pages`, icon: "✎",  go: "db-list" },
        { key: "finance",    n: "가계부",   c: "#FDEBEC", fg: "#D44C47", sub: `${finance.length} 건`,     icon: "₩",  go: "db-list" },
        { key: "reflection", n: "스크립트", c: "#F4EEEE", fg: "#9F6B53", sub: `${reflection.length} 편`,   icon: "✐", go: "db-list" },
      ]);

      // Recent: mix of insights + works, newest first
      const combined = [
        ...insights.map(i => ({ id: i.id, n: i.title, cat: i.category || "인사이트", at: i.lastEditedAt })),
        ...works.map(w => ({ id: w.id, n: w.title, cat: w.category || "Works", at: null })),
      ];
      const recentItems = combined
        .sort((a, b) => (b.at ? new Date(b.at).getTime() : 0) - (a.at ? new Date(a.at).getTime() : 0))
        .slice(0, 4)
        .map(r => ({ id: r.id, n: r.n, sub: `${r.cat}${r.at ? " · " + relLabel(r.at) : ""}`, icon: catToEmoji(r.cat) }));
      setRecent(recentItems);

      setIsMock(anyMock);
      setLoading(false);
    }).catch(() => {
      // Network error → fall back to mock so UI isn't empty
      setToday(MOCK_TODAY);
      setRecent(MOCK_RECENT);
      setIsMock(true);
      setLoading(false);
    });
  }, []);

  return (
    <>
      <NavBar title="안녕하세요, 현우" subtitle="Tuesday · Apr 22"
        right={<>
          <NavIconBtn icon="sync"/>
          <NavIconBtn icon="settings" onClick={() => go("settings")}/>
        </>}
      />
      <div style={{flex: 1, overflowY: "auto"}} className="hide-scroll">
        {/* search bar */}
        <div style={{padding: "0 16px 14px"}}>
          <div className="input" onClick={() => go("search")} style={{display: "flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "12px 14px"}}>
            <Icon name="search" size={18} color="var(--n-text-muted)"/>
            <span className="t-body muted" style={{flex: 1}}>무엇이든 검색, 명령 실행</span>
            <span className="kbd">⌘K</span>
          </div>
        </div>

        {/* DBs shelf */}
        <div className="g-header" style={{paddingTop: 6}}>데이터베이스</div>
        <div style={{display: "flex", gap: 12, padding: "0 16px 4px", overflowX: "auto"}} className="hide-scroll">
          {dbs.map((d, i) => (
            <div key={i} onClick={() => go(d.go || "db-list", { dbKey: d.key })} style={{
              flex: "0 0 134px", padding: 14,
              background: "var(--n-surface)", borderRadius: "var(--r-lg)",
              cursor: "pointer", boxShadow: "var(--sh-1)",
            }}>
              <div className="icon-tile icon-tile--lg" style={{background: d.c, color: d.fg, marginBottom: 28}}>{d.icon}</div>
              <div className="t-headline">{d.n}</div>
              <div className="t-footnote">{d.sub}</div>
            </div>
          ))}
          <div style={{flex: "0 0 4px"}}/>
        </div>

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
            <div key={i} className="g-row" onClick={() => e.id ? go("page", {id: e.id}) : go("page")} style={{cursor: "pointer"}}>
              <div style={{width: 3, alignSelf: "stretch", borderRadius: 2, background: `var(--n-tag-${e.c}-fg)`, margin: "2px 4px 2px 0"}}/>
              <div style={{flex: 1}}>
                <div className="t-headline">{e.t}</div>
                <div className="t-footnote">{e.time}</div>
              </div>
              <div className="chev"/>
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
                <div className="t-footnote">{r.sub}</div>
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
        else if (i === 4) go("settings");
      }}/>
    </>
  );
}

function SearchScreen({ go, goBack }) {
  const [q, setQ] = uS1("");
  const [results, setResults] = uS1([]);
  const [searching, setSearching] = uS1(false);
  const suggestions = [
    { k: "AI", t: "지난주 미팅 요약 보기", i: "sparkle" },
    { k: "최근", t: "오늘 할 일 모아보기", i: "clock" },
  ];
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
          <button className="btn btn--ghost" style={{padding: "6px 4px"}} onClick={() => go("home")}>취소</button>
        </div>
      </div>
      <div style={{flex: 1, overflowY: "auto"}}>
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
                <div key={r.id || i} className="g-row g-row--with-icon" onClick={() => go("page", {id: r.id})} style={{cursor: "pointer"}}>
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
                  <span className="kbd">{a.k}</span>
                </div>
              ))}
            </div>
            <div className="g-header" style={{marginTop: 18}}>추천</div>
            <div className="g-list">
              {suggestions.map((s, i) => (
                <div key={i} className="g-row g-row--with-icon" onClick={() => go("home")}>
                  <div className="icon-tile" style={{background: s.k === "AI" ? "#EAE4F2" : "var(--n-surface-hover)", color: s.k === "AI" ? "#9065B0" : "var(--n-text)"}}>
                    <Icon name={s.i} size={15}/>
                  </div>
                  <div style={{flex: 1}}>
                    <div className="t-body" style={{fontWeight: 500}}>{s.t}</div>
                    <div className="t-footnote">{s.k}</div>
                  </div>
                  <div className="chev"/>
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

Object.assign(window, { OnboardingScreen, TokenScreen, DbPickerScreen, HomeScreen, SearchScreen });
